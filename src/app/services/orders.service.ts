// src/app/services/orders.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, finalize } from 'rxjs';
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
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  private apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) {
    this.loadOrders();
  }

  private resolveFoodId(item: OrderedFoodItem): number | undefined {
    return item.foodId ?? item.foodOption?.id ?? item.id;
  }

  private toApiItems(items: OrderedFoodItem[]): Array<{ foodId: number; quantity: number }> {
    const normalized = items
      .map((item) => ({
        foodId: Number(this.resolveFoodId(item)),
        quantity: Number(item.quantity),
      }))
      .filter(
        (
          item,
        ): item is {
          foodId: number;
          quantity: number;
        } => Number.isFinite(item.foodId) && item.foodId > 0 && Number.isFinite(item.quantity),
      );

    const hasInvalidPositiveQuantity = items.some((item) => {
      const quantity = Number(item.quantity);
      return quantity > 0 && !Number.isFinite(Number(this.resolveFoodId(item)));
    });

    if (hasInvalidPositiveQuantity) {
      throw new Error('Invalid food item payload: missing foodId');
    }

    return normalized.filter((item) => item.quantity > 0);
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
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http
      .get(this.apiUrl, { responseType: 'text' })
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (raw) => {
          const orders = this.parseArrayResponse<FlightOrder>(raw, 'orders');
          this.ordersSubject.next(orders);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to load orders', err);
          const withStatus = err.status ? ` (${err.status})` : '';
          this.errorSubject.next(`Unable to load orders${withStatus}. Please try again.`);
        },
      });
  }

  /** Force reload orders from backend */
  refreshOrders() {
    this.loadOrders();
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
    const payload = {
      flightId: order.flightId,
      status: order.status,
      itemsRequested: this.toApiItems(order.itemsRequested),
      lastUpdated: order.lastUpdated,
    };

    return this.http.post<FlightOrder>(this.apiUrl, payload).pipe(
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

    const updatedOrder = {
      ...order,
      status,
      itemsRequested: this.toApiItems(order.itemsRequested),
      lastUpdated: new Date(),
    };
    return this.http.put<FlightOrder>(`${this.apiUrl}/${order.id}`, updatedOrder).pipe(
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

    const updatedOrder = {
      ...order,
      itemsRequested: this.toApiItems(items),
      lastUpdated: new Date(),
    };
    return this.http.put<FlightOrder>(`${this.apiUrl}/${order.id}`, updatedOrder).pipe(
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
