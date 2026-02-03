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

@Component({
  selector: 'app-view-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, BackButton, TabsComponent, UpcomingOrdersGridComponent],
  templateUrl: './view-orders.html',
  // styleUrls: ['./view-orders.scss'],
})
export class ViewOrders implements OnInit {
  private flightService = inject(FlightService);
  private orderService = inject(OrderService);
  public router = inject(Router);

  FOODOPTIONS = FOODOPTIONS;

  orderQuantities: Record<number, number> = {};
  foodMap: Record<number, string> = {};

  upcomingOrders = signal<any[]>([]);
  previousOrders = signal<any[]>([]);
  showAddModal = signal(false);

  activeTab: OrderTab = 'upcoming';
  selectedFlightId: number | null = null;

  selectedFlight = signal<Flight | null>(null);
  currentTotal = signal(0);
  remainingSeats = signal(0);

  ngOnInit() {
    this.foodMap = Object.fromEntries(this.FOODOPTIONS.map((f) => [f.id, f.name]));

    combineLatest([this.flightService.getFlights(), this.orderService.getOrders()]).subscribe(
      ([flights, orders]) => {
        this.processData(flights, orders);
      },
    );
  }

  private processData(flights: Flight[], orders: FlightOrder[]) {
    const now = new Date();

    const enriched = flights
      .filter((f) => f.foodRequested)
      .map((f) => {
        const order = orders.find((o) => o.flightId === f.id);
        return {
          ...f,
          orderInfo: order || { status: 'PENDING' as OrderStatus, itemsRequested: [] },
        };
      })
      .sort(
        (a, b) =>
          new Date(`${a.departureDate}T${a.departureTime}`).getTime() -
          new Date(`${b.departureDate}T${b.departureTime}`).getTime(),
      );

    this.upcomingOrders.set(
      enriched.filter((f) => new Date(`${f.departureDate}T${f.departureTime}`) >= now),
    );
    this.previousOrders.set(
      enriched.filter((f) => new Date(`${f.departureDate}T${f.departureTime}`) < now),
    );
  }

  selectFlight(flightId: number) {
    this.selectedFlightId = flightId;

    const flight = this.flightService.getFlightsSnapshot().find((f) => f.id === flightId);
    if (!flight) return;

    this.selectedFlight.set(flight);

    const order = this.orderService.getOrderByFlightId(flightId);
    this.orderQuantities = {};

    this.filteredFoodOptions.forEach((opt) => {
      this.orderQuantities[opt.id] =
        order?.itemsRequested.find((i) => i.foodId === opt.id)?.quantity || 0;
    });

    this.recalculateTotals();
  }

  recalculateTotals() {
    const total = Object.values(this.orderQuantities).reduce((sum, q) => sum + (q || 0), 0);
    this.currentTotal.set(total);

    const seats = this.selectedFlight()?.seats || 0;
    this.remainingSeats.set(seats - total);
  }

  saveOrder(flightId: number) {
    const flight = this.selectedFlight();
    if (!flight) return;

    const items: OrderedFoodItem[] = Object.entries(this.orderQuantities)
      .map(([foodId, quantity]) => ({ foodId: Number(foodId), quantity }))
      .filter((i) => i.quantity > 0);

    if (
      items.some(
        (i) => !this.FOODOPTIONS.find((o) => o.id === i.foodId && o.type === flight.preferredFood),
      )
    ) {
      alert('Invalid food type selected for this flight');
      return;
    }

    if (this.currentTotal() !== flight.seats) {
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
    this.processData(
      this.flightService.getFlightsSnapshot(),
      this.orderService.getOrdersSnapshot(),
    );
  }

  updateStatus(flightId: number, status: OrderStatus) {
    this.orderService.updateOrderStatus(flightId, status);

    // Re-process flights and orders to update upcoming/previous lists
    const flights = this.flightService.getFlightsSnapshot();
    const orders = this.orderService.getOrdersSnapshot();
    this.processData(flights, orders);

    // Optionally switch tab if the order is now complete or delivered
    if (status === 'COMPLETE') {
      this.activeTab = 'previous';
    }
  }

  getFoodName(foodId: number): string {
    return this.foodMap[foodId] || '';
  }

  // Computed property for template
  get filteredFoodOptions() {
    const flight = this.selectedFlight();
    if (!flight) return [];
    if (flight.preferredFood === 'Mixed') return this.FOODOPTIONS; // Show all for mixed
    return this.FOODOPTIONS.filter((o) => o.type === flight.preferredFood);
  }
}
