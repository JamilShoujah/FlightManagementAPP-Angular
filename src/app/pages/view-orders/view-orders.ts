// src/app/pages/view-orders/view-orders.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';

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
  public router = inject(Router);

  FOODOPTIONS = FOODOPTIONS;

  orderQuantities: Record<number, number> = {};
  foodMap: Record<number, string> = {};

  upcomingOrders = signal<FlightWithOrder[]>([]);
  previousOrders = signal<FlightWithOrder[]>([]);
  showAddModal = signal(false);

  activeTab: OrderTab = 'upcoming';
  selectedFlightId: number | null = null;
  selectedFlight = signal<FlightWithOrder | null>(null);

  currentTotal = signal(0);
  remainingSeats = signal(0);

  today: Date = new Date();

  ngOnInit() {
    // Map food id → name
    this.foodMap = Object.fromEntries(this.FOODOPTIONS.map((f) => [f.id, f.name]));

    // Load flights + orders
    combineLatest([this.flightService.getFlights(), this.orderService.getOrders()]).subscribe(
      ([flights, orders]) => this.processData(flights, orders),
    );
  }

  private processData(flights: Flight[], orders: FlightOrder[]) {
    const now = new Date();

    const enriched: FlightWithOrder[] = flights
      .filter((f) => f.foodRequested)
      .map((f) => {
        const order = orders.find((o) => o.flightId === f.id);
        return {
          ...f,
          orderInfo: order || {
            flightId: f.id,
            status: 'PENDING' as OrderStatus,
            itemsRequested: [],
            lastUpdated: new Date(),
          },
        };
      });

    // separate upcoming and previous orders
    this.upcomingOrders.set(
      enriched.filter((f) => new Date(`${f.departureDate}T${f.departureTime}`) >= now),
    );
    this.previousOrders.set(
      enriched.filter((f) => new Date(`${f.departureDate}T${f.departureTime}`) < now),
    );
  }

  selectFlight(flightId: number) {
    this.selectedFlightId = flightId;

    const allFlights = [...this.upcomingOrders(), ...this.previousOrders()];
    const flight = allFlights.find((f) => f.id === flightId);
    if (!flight) return;

    this.selectedFlight.set({ ...flight });

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

  saveOrder(flightId: number, items: OrderedFoodItem[]) {
    const flight = this.selectedFlight();
    if (!flight) return;

    if (
      items.some(
        (i) =>
          !this.FOODOPTIONS.find(
            (o) =>
              o.id === i.foodId &&
              (flight.preferredFood === 'Mixed' || o.type === flight.preferredFood),
          ),
      )
    ) {
      alert('Invalid food type selected for this flight');
      return;
    }

    if (items.reduce((sum, i) => sum + i.quantity, 0) !== flight.seats) {
      alert(`Total meals must equal plane capacity (${flight.seats})`);
      return;
    }

    const existing = this.orderService.getOrderByFlightId(flightId);
    if (existing) this.orderService.updateOrderItems(flightId, items);
    else
      this.orderService.addOrder({
        flightId,
        status: 'PENDING',
        itemsRequested: items,
        lastUpdated: new Date(),
      });

    this.showAddModal.set(false);
    this.selectedFlight.set(null);

    this.processData(
      this.flightService.getFlightsSnapshot(),
      this.orderService.getOrdersSnapshot(),
    );
  }

  updateStatus(flightId: number, status: OrderStatus) {
    this.orderService.updateOrderStatus(flightId, status);
    this.processData(
      this.flightService.getFlightsSnapshot(),
      this.orderService.getOrdersSnapshot(),
    );

    if (status === 'COMPLETE') this.activeTab = 'previous';
  }

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
