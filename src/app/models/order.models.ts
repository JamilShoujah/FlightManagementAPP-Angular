export type OrderStatus = 'PENDING' | 'COMPLETE';

export interface OrderedFoodItem {
  id?: number; // The database ID (optional for new items)
  foodId?: number; // food option id used by backend payloads
  name?: string; // optional UI label
  quantity: number;
  foodOption?: {
    // This maps to the ManyToOne relationship in Java
    id: number;
    name?: string;
  };
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
export interface CreateFlightOrder {
  flightId: number;
  status: string;
  itemsRequested: OrderedFoodItem[];
  lastUpdated: Date;
}
