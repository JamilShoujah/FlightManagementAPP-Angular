// src/app/models/flight-with-order.model.ts
import { Flight } from './flights.model';
import { FlightOrder } from './order.models';

export interface FlightWithOrder extends Flight {
  orderInfo: FlightOrder;
}
