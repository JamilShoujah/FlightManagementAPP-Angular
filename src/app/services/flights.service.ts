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

  getFlights(): Observable<Flight[]> {
    return this.flightsSubject.asObservable();
  }

  addFlight(newFlight: Flight): void {
    this.flightsData = [...this.flightsData, newFlight];
    this.flightsSubject.next(this.flightsData);
  }
}
