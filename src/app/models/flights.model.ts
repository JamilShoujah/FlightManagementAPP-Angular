import { FoodType } from '../constants/food.constant';

// src / app / models / flights.model.ts;
export interface Flight {
  id: number;
  brand: string;
  planeType: string;
  crewCount: number;
  seats: number;
  preferredFood: FoodType;
  arrivalDate: string;
  departureDate: string;
  departureTime: string;
  foodRequested: boolean;
}
