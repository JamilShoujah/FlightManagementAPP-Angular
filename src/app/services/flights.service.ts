import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FLIGHTS } from '../constants/flights.constant';
import { Flight } from '../models/flights.model';

@Injectable({
  providedIn: 'root', // makes it available app-wide
})
export class FlightService {
  constructor() {}

  // For now, just return the constant array as an Observable
  getFlights(): Observable<Flight[]> {
    return of(FLIGHTS);
  }
}
