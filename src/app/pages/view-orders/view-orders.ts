import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';

import { Flight } from '../../models/flights.model';
import { FlightService } from '../../services/flights.service';
import { FlightOrder, OrderedFoodItem, OrderStatus } from '../../models/order.models';
import { OrderService } from '../../services/orders.service';
import { FOODOPTIONS } from '../../constants/food.constant';
import { BackButton } from '../../components/back-button/back-button';
import { TabsComponent } from './tabs/tabs';
import { OrderTab } from '../../constants/ordertab.constant';
import { UpcomingOrdersGridComponent } from './order-grid/order-grid';
import { PreviousOrdersGridComponent } from './previous-orders-grid/previous-orders-grid';
import { DateDisplayComponent } from '../../components/date-display/date-display';
import { EditOrderModalComponent } from './edit-order-modal/edit-order-modal';
import { FlightWithOrder } from '../../models/flight&order.model';
import { ClockService } from '../../services/clock.service';

@Component({
  selector: 'app-view-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BackButton,
    TabsComponent,
    UpcomingOrdersGridComponent,
    PreviousOrdersGridComponent,
    DateDisplayComponent,
    EditOrderModalComponent,
  ],
  templateUrl: './view-orders.html',
  styleUrls: ['./view-orders.scss'],
})
export class ViewOrders implements OnInit {
  private flightService = inject(FlightService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private clockService = inject(ClockService);

  // --- Constants & mappings ---
  FOODOPTIONS = FOODOPTIONS;
  foodMap: Record<number, string> = {};

  // --- Signals ---
  upcomingOrders = signal<FlightWithOrder[]>([]);
  previousOrders = signal<FlightWithOrder[]>([]);
  showAddModal = signal(false);
  selectedFlight = signal<FlightWithOrder | null>(null);

  currentTotal = signal(0);
  remainingSeats = signal(0);

  // --- State ---
  activeTab: OrderTab = 'upcoming';
  selectedFlightId: number | null = null;

  today$!: Observable<Date>;
  orderQuantities: Record<number, number> = {};

  ngOnInit() {
    this.today$ = this.clockService.now$;

    // Map food ID → name
    this.foodMap = Object.fromEntries(this.FOODOPTIONS.map((f) => [f.id, f.name]));

    // Load flights + orders
    combineLatest([this.flightService.getFlights(), this.orderService.getOrders()]).subscribe(
      ([flights, orders]) => this.processData(flights, orders),
    );
  }

  // --- Process flights & orders ---
  private processData(flights: Flight[], orders: FlightOrder[]) {
    const now = new Date();

    const enriched: FlightWithOrder[] = flights
      .filter((f) => f.foodRequested)
      .map((f) => ({
        ...f,
        orderInfo: orders.find((o) => o.flightId === f.id) || {
          flightId: f.id,
          status: 'PENDING' as OrderStatus,
          itemsRequested: [],
          lastUpdated: new Date(),
        },
      }));

    this.upcomingOrders.set(
      enriched.filter((f) => new Date(`${f.departureDate}T${f.departureTime}`) >= now),
    );
    this.previousOrders.set(
      enriched.filter((f) => new Date(`${f.departureDate}T${f.departureTime}`) < now),
    );
  }

  // --- Select a flight to edit ---
  selectFlight(flightId: number) {
    this.selectedFlightId = flightId;

    const allFlights = [...this.upcomingOrders(), ...this.previousOrders()];
    const flight = allFlights.find((f) => f.id === flightId);
    if (!flight) return;

    this.selectedFlight.set({ ...flight });

    // Initialize quantities
    const quantities: Record<number, number> = {};
    this.FOODOPTIONS.forEach((opt) => {
      quantities[opt.id] =
        flight.orderInfo.itemsRequested.find((i) => i.foodId === opt.id)?.quantity || 0;
    });
    this.orderQuantities = quantities;

    this.recalculateTotals();
    this.showAddModal.set(true);
  }

  recalculateTotals() {
    const total = Object.values(this.orderQuantities).reduce((sum, q) => sum + (q || 0), 0);
    this.currentTotal.set(total);

    const seats = this.selectedFlight()?.seats || 0;
    this.remainingSeats.set(seats - total);
  }

  // --- Save edited order ---
  saveOrder(flightId: number, items: OrderedFoodItem[]) {
    const flight = this.selectedFlight();
    if (!flight) return;

    // Validate food types
    const invalid = items.some(
      (i) =>
        !this.FOODOPTIONS.find(
          (o) =>
            o.id === i.foodId &&
            (flight.preferredFood === 'Mixed' || o.type === flight.preferredFood),
        ),
    );
    if (invalid) return alert('Invalid food type selected for this flight');

    // Validate total meals
    const totalMeals = items.reduce((sum, i) => sum + i.quantity, 0);
    if (totalMeals !== flight.seats)
      return alert(`Total meals must equal plane capacity (${flight.seats})`);

    // Add/update order
    const existing = this.orderService.getOrderByFlightId(flightId);
    if (existing) this.orderService.updateOrderItems(flightId, items);
    else
      this.orderService.addOrder({
        flightId,
        status: 'PENDING',
        itemsRequested: items,
        lastUpdated: new Date(),
      });

    // Reset modal
    this.showAddModal.set(false);
    this.selectedFlight.set(null);

    // Refresh data
    this.processData(
      this.flightService.getFlightsSnapshot(),
      this.orderService.getOrdersSnapshot(),
    );
  }

  // --- Update order status ---
  updateStatus(flightId: number, status: OrderStatus) {
    const flight = [...this.upcomingOrders(), ...this.previousOrders()].find(
      (f) => f.id === flightId,
    );
    if (!flight) return;

    // Update in-place
    flight.orderInfo.status = status;

    // Move to previous tab if complete
    if (status === 'COMPLETE') {
      // Keep in upcomingOrders for immediate UI update
      const updatedUpcoming = this.upcomingOrders().filter((f) => f.id !== flightId);
      this.upcomingOrders.set(updatedUpcoming);

      // Add to previousOrders
      this.previousOrders.update((prev) => [...prev, flight]);
    }
  }

  // --- Helpers ---
  getFoodName(foodId?: number): string {
    return foodId != null ? this.foodMap[foodId] || '' : '';
  }

  get filteredFoodOptions() {
    const flight = this.selectedFlight();
    if (!flight) return [];
    if (flight.preferredFood === 'Mixed') return this.FOODOPTIONS;
    return this.FOODOPTIONS.filter((o) => o.type === flight.preferredFood);
  }
}
