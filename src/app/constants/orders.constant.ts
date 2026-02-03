// src/app/constants/orders.constant.ts
import { FlightOrder } from '../models/order.models';
import { FLIGHTS } from './flights.constant';
import { FOODOPTIONS } from './food.constant';

// Helper to generate random orders for a flight
function generateRandomOrder(
  flightId: number,
  seats: number,
  preferredFood: 'Beef' | 'Chicken' | 'Fish' | 'Vegetarian' | 'Vegan' | 'Mixed',
) {
  const options = FOODOPTIONS.filter((opt) => {
    if (preferredFood === 'Mixed') return true;
    if (preferredFood === 'Vegetarian') return opt.type === 'Vegetarian' || opt.type === 'Vegan';
    return opt.type === preferredFood;
  });

  const items = options.map((opt) => ({
    foodId: opt.id,
    quantity: Math.floor(Math.random() * (seats / options.length)) + 1,
  }));

  const total = items.reduce((sum, i) => sum + i.quantity, 0);
  const diff = seats - total;
  if (diff !== 0 && items.length > 0) items[0].quantity += diff;

  return {
    flightId,
    status: 'COMPLETE' as const,
    itemsRequested: items.filter((i) => i.quantity > 0),
    lastUpdated: new Date(),
  };
}

// Get current date for comparison
const now = new Date();

export const ORDERS: FlightOrder[] = [
  // Existing orders
  {
    flightId: 1,
    status: 'COMPLETE',
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

  // Auto-generate completed orders for departed flights
  ...FLIGHTS.filter((f) => {
    const depDateTime = new Date(`${f.departureDate}T${f.departureTime}`);
    return depDateTime < now && f.foodRequested;
  }).map((flight) => generateRandomOrder(flight.id, flight.seats, flight.preferredFood)),
];
