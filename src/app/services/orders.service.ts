// src/app/services/orders.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateFlightOrder,
  FlightOrder,
  OrderedFoodItem,
  OrderStatus,
} from '../models/order.models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private ordersSubject = new BehaviorSubject<FlightOrder[]>([]);
  orders$ = this.ordersSubject.asObservable();

  private apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) {
    this.loadOrders();
  }

  private parseArrayResponse<T>(raw: unknown, resourceName: string): T[] {
    if (Array.isArray(raw)) return raw as T[];
    if (raw == null) return [];

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) return [];

      try {
        const parsed = JSON.parse(trimmed) as unknown;
        return this.parseArrayResponse<T>(parsed, resourceName);
      } catch (err) {
        console.error(`Failed to parse ${resourceName} response as JSON`, err, raw);
        return [];
      }
    }

    if (typeof raw === 'object') {
      const wrapped = raw as { data?: unknown; content?: unknown };
      if (Array.isArray(wrapped.data)) return wrapped.data as T[];
      if (Array.isArray(wrapped.content)) return wrapped.content as T[];
    }

    console.error(`Unexpected ${resourceName} response shape`, raw);
    return [];
  }

  /** Load all orders from backend */
  loadOrders() {
    this.http.get(this.apiUrl, { responseType: 'text' }).subscribe({
      next: (raw) => {
        const orders = this.parseArrayResponse<FlightOrder>(raw, 'orders');
        this.ordersSubject.next(orders);
      },
      error: (err) => console.error('Failed to load orders', err),
    });
  }

  /** Observable for all orders */
  getOrders(): Observable<FlightOrder[]> {
    return this.orders$;
  }

  /** Snapshot of current orders */
  getOrdersSnapshot(): FlightOrder[] {
    return this.ordersSubject.getValue();
  }

  /** Synchronous: Get single order by flightId */
  getOrderByFlightId(flightId: number): FlightOrder | undefined {
    return this.getOrdersSnapshot().find((o) => o.flightId === flightId);
  }

  /** Observable: Get single order by orderId from API */
  getOrderById$(orderId: number): Observable<FlightOrder> {
    return this.http.get<FlightOrder>(`${this.apiUrl}/${orderId}`);
  }

  /** Add a new order */
  addOrder(order: CreateFlightOrder): Observable<FlightOrder> {
    return this.http.post<FlightOrder>(this.apiUrl, order).pipe(
      tap((created) => {
        const current = this.getOrdersSnapshot();
        this.ordersSubject.next([...current, created]);
      }),
    );
  }

  /** Delete an order by ID */
  deleteOrder(orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${orderId}`).pipe(
      tap(() => {
        const current = this.getOrdersSnapshot().filter((o) => o.id !== orderId);
        this.ordersSubject.next(current);
      }),
    );
  }

  /** Update order status */
  updateOrderStatus(flightId: number, status: OrderStatus): Observable<FlightOrder> {
    const order = this.getOrderByFlightId(flightId);
    if (!order) throw new Error('Order not found');

    const updatedOrder = { ...order, status, lastUpdated: new Date() };
    return this.http.post<FlightOrder>(this.apiUrl, updatedOrder).pipe(
      tap((resp) => {
        const orders = this.getOrdersSnapshot().map((o) => (o.id === resp.id ? resp : o));
        this.ordersSubject.next(orders);
      }),
    );
  }

  /** Update order items */
  updateOrderItems(flightId: number, items: OrderedFoodItem[]): Observable<FlightOrder> {
    const order = this.getOrderByFlightId(flightId);
    if (!order) throw new Error('Order not found');

    const updatedOrder = { ...order, itemsRequested: items, lastUpdated: new Date() };
    return this.http.post<FlightOrder>(this.apiUrl, updatedOrder).pipe(
      tap((resp) => {
        const orders = this.getOrdersSnapshot().map((o) => (o.id === resp.id ? resp : o));
        this.ordersSubject.next(orders);
      }),
    );
  }

  /** Optional: Observable version to get order by flightId */
  getOrderByFlightId$(flightId: number): Observable<FlightOrder | undefined> {
    return this.orders$.pipe(map((orders) => orders.find((o) => o.flightId === flightId)));
  }
}
