// src/app/models/order.models.ts
export type OrderStatus = 'PENDING' | 'COMPLETE';

export interface OrderedFoodItem {
  foodId: number;
  quantity: number;
}

export interface FlightOrder {
  flightId: number; // Links to Flight.id
  status: OrderStatus;
  itemsRequested: OrderedFoodItem[];
  lastUpdated: Date;
}
