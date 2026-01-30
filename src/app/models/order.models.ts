export type OrderStatus = 'PENDING' | 'COMPLETE' | 'NOT_ACCEPTED';

export interface FlightOrder {
  id: number;
  flightNumber: string;
  orderDate: Date;
  dueDate: Date;
  status: OrderStatus;
  items: string;
}
