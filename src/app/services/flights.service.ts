// src / app / services / flights.service.ts;

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { FLIGHTS } from '../constants/flights.constant';
import { Flight } from '../models/flights.model';

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  // Use a BehaviorSubject to make the data "live" across the app
  private flightsData = [...FLIGHTS];
  private flightsSubject = new BehaviorSubject<Flight[]>(this.flightsData);

  // Observable of flights
  getFlights(): Observable<Flight[]> {
    return this.flightsSubject.asObservable();
  }

  // Add a new flight
  addFlight(newFlight: Flight): void {
    this.flightsData = [...this.flightsData, newFlight];
    this.flightsSubject.next(this.flightsData);
  }

  // Return a snapshot of the current flights
  getFlightsSnapshot(): Flight[] {
    return [...this.flightsData]; // shallow copy
  }
}
