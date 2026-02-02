// src / app / services / orders.service.ts;
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ORDERS } from '../constants/orders.constant';
import { FlightOrder, OrderedFoodItem, OrderStatus } from '../models/order.models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private ordersData = [...ORDERS];
  private ordersSubject = new BehaviorSubject<FlightOrder[]>(this.ordersData);

  getOrders(): Observable<FlightOrder[]> {
    return this.ordersSubject.asObservable();
  }

  getOrdersSnapshot(): FlightOrder[] {
    return [...this.ordersData];
  }

  getOrderByFlightId(flightId: number): FlightOrder | undefined {
    return this.ordersData.find((o) => o.flightId === flightId);
  }

  addOrder(order: FlightOrder) {
    this.ordersData.push(order);
    this.ordersSubject.next([...this.ordersData]);
  }

  updateOrderStatus(flightId: number, status: OrderStatus) {
    const index = this.ordersData.findIndex((o) => o.flightId === flightId);
    if (index !== -1) {
      this.ordersData[index] = { ...this.ordersData[index], status, lastUpdated: new Date() };
      this.ordersSubject.next([...this.ordersData]);
    }
  }

  updateOrderItems(flightId: number, newItems: OrderedFoodItem[]) {
    const index = this.ordersData.findIndex((o) => o.flightId === flightId);
    if (index !== -1) {
      this.ordersData[index] = {
        ...this.ordersData[index],
        itemsRequested: newItems,
        lastUpdated: new Date(),
      };
      this.ordersSubject.next([...this.ordersData]);
    }
  }
}
