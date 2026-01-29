// models/flight.model.ts
export interface Flight {
  id: number;
  brand: string;
  planeType: string;
  crewCount: number;
  seats: number;
  preferredFood: string;
  arrivalDate: string;
  departureDate: string;
  departureTime: string;
  foodRequested: boolean;
}
