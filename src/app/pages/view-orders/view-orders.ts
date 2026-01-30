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
import { FOODOPTIONS, FoodOption } from '../../constants/food.constant';

@Component({
  selector: 'app-view-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-orders.html',
  styleUrls: ['./view-orders.scss'],
})
export class ViewOrders implements OnInit {
  private flightService = inject(FlightService);
  private orderService = inject(OrderService);
  public router = inject(Router);

  FOODOPTIONS = FOODOPTIONS;
  orderQuantities: Record<number, number> = {}; // foodId -> quantity
  foodMap: Record<number, string> = {}; // for template lookup

  upcomingOrders = signal<any[]>([]);
  previousOrders = signal<any[]>([]);
  availableFlights = signal<Flight[]>([]);
  showAddModal = signal(false);

  today = new Date();
  activeTab = 'upcoming';
  selectedFlightId: number | null = null;

  ngOnInit() {
    // create fast lookup map
    this.foodMap = Object.fromEntries(this.FOODOPTIONS.map((f) => [f.id, f.name]));

    combineLatest([this.flightService.getFlights(), this.orderService.getOrders()]).subscribe(
      ([flights, orders]) => {
        this.processData(flights, orders);
        this.updateAvailableFlights(flights, orders);
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
          orderInfo: order || {
            status: 'PENDING' as OrderStatus,
            itemsRequested: FOODOPTIONS.filter((o) => o.type === 'Vegetarian').map((o) => ({
              foodId: o.id,
              quantity: 0,
            })),
          },
        };
      });

    const sorted = enriched.sort(
      (a, b) =>
        new Date(`${a.departureDate}T${a.departureTime}`).getTime() -
        new Date(`${b.departureDate}T${b.departureTime}`).getTime(),
    );

    this.upcomingOrders.set(
      sorted.filter((f) => new Date(`${f.departureDate}T${f.departureTime}`) >= now),
    );
    this.previousOrders.set(
      sorted.filter((f) => new Date(`${f.departureDate}T${f.departureTime}`) < now),
    );
  }

  private updateAvailableFlights(flights: Flight[], orders: FlightOrder[]) {
    const available = flights.filter(
      (f) => f.foodRequested && !orders.some((o) => o.flightId === f.id),
    );
    this.availableFlights.set(available);
  }

  selectFlight(flightId: number) {
    this.selectedFlightId = flightId;
    const order = this.orderService.getOrderByFlightId(flightId);
    this.FOODOPTIONS.forEach((opt) => {
      this.orderQuantities[opt.id] =
        order?.itemsRequested.find((i) => i.foodId === opt.id)?.quantity || 0;
    });
  }

  saveOrder(flightId: number) {
    const flight = this.flightService.getFlightsSnapshot().find((f) => f.id === flightId);
    if (!flight) return;

    const items: OrderedFoodItem[] = this.FOODOPTIONS.map((opt) => ({
      foodId: opt.id,
      quantity: this.orderQuantities[opt.id] || 0,
    })).filter((i) => i.quantity > 0);

    const total = items.reduce((sum, i) => sum + i.quantity, 0);
    if (total !== flight.seats) {
      alert(`Total meals must equal total seats (${flight.seats})`);
      return;
    }

    const order = this.orderService.getOrderByFlightId(flightId);
    if (order) this.orderService.updateOrderItems(flightId, items);
    else
      this.orderService.addOrder({
        flightId,
        status: 'PENDING',
        itemsRequested: items,
        lastUpdated: new Date(),
      });

    this.showAddModal.set(false);
    const flights = this.flightService.getFlightsSnapshot();
    const orders = this.orderService.getOrdersSnapshot();
    this.processData(flights, orders);
    this.updateAvailableFlights(flights, orders);
  }

  updateStatus(flightId: number, status: OrderStatus) {
    this.orderService.updateOrderStatus(flightId, status);
    const flights = this.flightService.getFlightsSnapshot();
    const orders = this.orderService.getOrdersSnapshot();
    this.processData(flights, orders);
  }

  getFoodName(foodId: number): string {
    return this.foodMap[foodId] || '';
  }
}
