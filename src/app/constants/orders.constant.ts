// src / app / constants / orders.constant.ts;
import { FlightOrder } from '../models/order.models';

export const ORDERS: FlightOrder[] = [
  {
    flightId: 1,
    status: 'PENDING',
    itemsRequested: [
      { foodId: 7, quantity: 450 }, // Vegetarian
      { foodId: 9, quantity: 50 }, // Vegan
    ],
    lastUpdated: new Date('2026-01-29T10:00:00'),
  },
  {
    flightId: 101,
    status: 'COMPLETE',
    itemsRequested: [{ foodId: 7, quantity: 210 }],
    lastUpdated: new Date('2026-01-24T18:00:00'),
  },
];
