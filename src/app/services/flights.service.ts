// src/app/services/flights.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Flight } from '../models/flights.model';

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  private apiUrl = `${environment.apiBaseUrl}/flights`;

  // Local cache for reactive updates
  private flightsSubject = new BehaviorSubject<Flight[]>([]);
  flights$ = this.flightsSubject.asObservable(); // public observable

  constructor(private http: HttpClient) {
    this.loadFlights(); // initialize with current data from backend
  }

  /** Load flights from backend */
  private loadFlights(): void {
    this.http.get<Flight[]>(this.apiUrl).subscribe({
      next: (flights) => this.flightsSubject.next(flights),
      error: (err) => console.error('Failed to load flights', err),
    });
  }

  /** Get flights as observable */
  getFlights(): Observable<Flight[]> {
    return this.flights$;
  }

  /** Get a single flight by ID */
  getFlightById(id: string | number): Observable<Flight> {
    return this.http.get<Flight>(`${this.apiUrl}/${id}`);
  }

  /** Add a new flight */
  addFlight(flight: Flight): Observable<Flight> {
    return this.http.post<Flight>(this.apiUrl, flight).pipe(
      tap((newFlight) => {
        const currentFlights = this.flightsSubject.getValue();
        this.flightsSubject.next([...currentFlights, newFlight]);
      }),
    );
  }

  /** Update an existing flight */
  updateFlight(id: string | number, flight: Flight): Observable<Flight> {
    return this.http.put<Flight>(`${this.apiUrl}/${id}`, flight).pipe(
      tap((updatedFlight) => {
        const flights = this.flightsSubject.getValue();
        const index = flights.findIndex((f) => f.id === id);
        if (index !== -1) {
          flights[index] = updatedFlight;
          this.flightsSubject.next([...flights]);
        }
      }),
    );
  }

  /** Delete a flight by ID */
  deleteFlight(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const flights = this.flightsSubject.getValue();
        this.flightsSubject.next(flights.filter((f) => f.id !== id));
      }),
    );
  }

  /** Get a snapshot of flights (for synchronous access if needed) */
  getFlightsSnapshot(): Flight[] {
    return [...this.flightsSubject.getValue()];
  }
}
