// src/app/pages/view-orders/view-orders.ts
import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, Observable, firstValueFrom } from 'rxjs';

import { Flight } from '../../models/flights.model';
import { FlightService } from '../../services/flights.service';
import {
  FlightOrder,
  OrderedFoodItem,
  OrderStatus,
  CreateFlightOrder, // ✅ important
} from '../../models/order.models';
import { OrderService } from '../../services/orders.service';
import { FOODOPTIONS } from '../../constants/food.constant';
import { BackButton } from '../../components/back-button/back-button';
import { TabsComponent } from './tabs/tabs';
import { OrderTab } from '../../constants/ordertab.constant';
import { UpcomingOrdersGridComponent } from './order-grid/order-grid';
import { PreviousOrdersGridComponent } from './previous-orders-grid/previous-orders-grid';
import { DateDisplayComponent } from '../../components/date-display/date-display';
import { EditOrderModalComponent } from './edit-order-modal/edit-order-modal';
import { ClockService } from '../../services/clock.service';
import { FlightWithOrder } from '../../models/flight-with-order';

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

  FOODOPTIONS = FOODOPTIONS;
  foodMap: Record<number, string> = {};

  upcomingOrders = signal<FlightWithOrder[]>([]);
  previousOrders = signal<FlightWithOrder[]>([]);
  showAddModal = signal(false);
  selectedFlight = signal<FlightWithOrder | null>(null);

  currentTotal = signal(0);
  remainingSeats = signal(0);

  activeTab: OrderTab = 'upcoming';
  selectedFlightId: number | null = null;

  today$!: Observable<Date>;
  orderQuantities: Record<number, number> = {};

  // ✅ Logs every time upcomingOrders changes
  logUpcomingOrders = effect(() => {
    console.log('🟢 Upcoming Orders:');
    this.upcomingOrders().forEach((f) => {
      console.log(`Flight ID: ${f.id}, Order ID: ${f.orderInfo ? f.orderInfo.id : 'NO ORDER'}`);
    });
  });

  ngOnInit() {
    this.today$ = this.clockService.now$;
    this.foodMap = Object.fromEntries(this.FOODOPTIONS.map((f) => [f.id, f.name]));

    combineLatest([this.flightService.getFlights(), this.orderService.getOrders()]).subscribe(
      ([flights, orders]) => {
        console.log('📦 Orders from backend:', orders);
        this.processData(flights, orders);
      },
    );
  }

  private processData(flights: Flight[], orders: FlightOrder[]) {
    const now = new Date();

    const enriched: FlightWithOrder[] = flights
      .filter((f) => f.foodRequested)
      .map((f) => {
        const order = orders.find((o) => Number(o.flightId) === Number(f.id));

        return {
          ...f,
          orderInfo: order ?? null,
        };
      });

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
        flight.orderInfo?.itemsRequested.find((i) => i.id === opt.id)?.quantity || 0;
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

  async saveOrder(flightId: number, items: OrderedFoodItem[]) {
    const flight = this.selectedFlight();
    if (!flight) return;

    const totalMeals = items.reduce((sum, i) => sum + i.quantity, 0);

    if (totalMeals !== flight.seats) {
      return alert(`Total meals must equal plane capacity (${flight.seats})`);
    }

    try {
      if (flight.orderInfo) {
        await firstValueFrom(this.orderService.updateOrderItems(flightId, items));
      } else {
        const newOrder = {
          flight: { id: flightId },
          status: 'PENDING',
          itemsRequested: items.map((item: any) => ({
            foodId: item.id,
            quantity: item.quantity,
          })),
          lastUpdated: new Date(),
        };

        await firstValueFrom(this.orderService.addOrder(newOrder));
      }

      this.showAddModal.set(false);
      this.selectedFlight.set(null);

      const flights = await firstValueFrom(this.flightService.getFlights());
      const orders = await firstValueFrom(this.orderService.getOrders());

      this.processData(flights, orders);
    } catch (err) {
      console.error(err);
      alert('Error saving order.');
    }
  }

  async updateStatus(flightId: number, status: OrderStatus) {
    try {
      await firstValueFrom(this.orderService.updateOrderStatus(flightId, status));

      const flights = await firstValueFrom(this.flightService.getFlights());
      const orders = await firstValueFrom(this.orderService.getOrders());

      this.processData(flights, orders);
    } catch (err) {
      console.error(err);
      alert('Error updating status.');
    }
  }

  getFoodName(foodId?: number): string {
    return foodId != null ? this.foodMap[foodId] || '' : '';
  }

  get filteredFoodOptions() {
    const flight = this.selectedFlight();
    if (!flight) return [];

    return flight.preferredFood === 'Mixed'
      ? this.FOODOPTIONS
      : this.FOODOPTIONS.filter((o) => o.type === flight.preferredFood);
  }
}
