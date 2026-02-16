export type OrderStatus = 'PENDING' | 'COMPLETE';

export interface OrderedFoodItem {
  id?: number; // The database ID (optional for new items)
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
  flight: { id: number }; // Change this
  status: string;
  itemsRequested: OrderedFoodItem[];
  lastUpdated: Date;
}
