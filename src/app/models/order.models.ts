export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETE';

export interface OrderedFoodItem {
  id: number;
  name: string;
  quantity: number;
}

export interface FlightOrder {
  id: number; // backend generated
  flightId: number;
  status: OrderStatus;
  itemsRequested: OrderedFoodItem[];
  lastUpdated: Date;
}

/**
 * Used when CREATING a new order
 * (no id because backend generates it)
 */
export type CreateFlightOrder = Omit<FlightOrder, 'id'>;
