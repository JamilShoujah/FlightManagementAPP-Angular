// src / app / models / flights.model.ts;
export interface Flight {
  id: number;
  brand: string;
  planeType: string;
  crewCount: number;
  seats: number;
  preferredFood: 'Beef' | 'Chicken' | 'Fish' | 'Vegetarian' | 'Vegan' | 'Mixed';
  arrivalDate: string;
  departureDate: string;
  departureTime: string;
  foodRequested: boolean;
}
