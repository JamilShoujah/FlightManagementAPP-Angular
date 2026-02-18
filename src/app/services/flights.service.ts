// src/app/services/flights.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, finalize, tap } from 'rxjs';
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
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFlights(); // initialize with current data from backend
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return value != null && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  }

  private toString(value: unknown, fallback = ''): string {
    if (value == null) return fallback;
    return typeof value === 'string' ? value : String(value);
  }

  private toNumber(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private toBoolean(value: unknown, fallback = false): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    if (typeof value === 'number') return value !== 0;
    return fallback;
  }

  private extractWrappedArray<T>(record: Record<string, unknown>): T[] | null {
    const arrayKeys = ['data', 'content', 'items', 'results', 'flights', 'value'];
    for (const key of arrayKeys) {
      const candidate = record[key];
      if (Array.isArray(candidate)) return candidate as T[];
    }

    const embedded = this.asRecord(record['_embedded']);
    if (embedded) {
      for (const value of Object.values(embedded)) {
        if (Array.isArray(value)) return value as T[];
      }
    }

    return null;
  }

  private parseArrayResponse<T>(raw: unknown, resourceName: string): T[] {
    if (Array.isArray(raw)) return raw as T[];
    if (raw == null) return [];

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) return [];

      try {
        const parsed = JSON.parse(trimmed) as unknown;
        return this.parseArrayResponse<T>(parsed, resourceName);
      } catch (err) {
        console.error(`Failed to parse ${resourceName} response as JSON`, err, raw);
        return [];
      }
    }

    const record = this.asRecord(raw);
    if (record) {
      const wrappedArray = this.extractWrappedArray<T>(record);
      if (wrappedArray) return wrappedArray;

      if ('id' in record || 'flightId' in record || 'flight_id' in record) {
        return [record as T];
      }
    }

    console.error(`Unexpected ${resourceName} response shape`, raw);
    return [];
  }

  private normalizeFlight(raw: unknown): Flight | null {
    const record = this.asRecord(raw);
    if (!record) return null;

    const id = this.toNumber(record['id'] ?? record['flightId'] ?? record['flight_id'], NaN);
    if (!Number.isFinite(id)) return null;

    return {
      id,
      brand: this.toString(record['brand'] ?? record['airline'] ?? record['airliner']),
      planeType: this.toString(
        record['planeType'] ?? record['plane_type'] ?? record['aircraftType'],
      ),
      crewCount: this.toNumber(record['crewCount'] ?? record['crew_count']),
      seats: this.toNumber(record['seats']),
      preferredFood: this.toString(
        record['preferredFood'] ?? record['preferred_food'] ?? record['foodPreference'],
        'Mixed',
      ) as Flight['preferredFood'],
      arrivalDate: this.toString(
        record['arrivalDate'] ?? record['arrival_date'] ?? record['arrival'],
      ),
      departureDate: this.toString(
        record['departureDate'] ?? record['departure_date'] ?? record['departure'],
      ),
      departureTime: this.toString(record['departureTime'] ?? record['departure_time']),
      foodRequested: this.toBoolean(record['foodRequested'] ?? record['food_requested']),
    };
  }

  /** Load flights from backend */
  private loadFlights(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http
      .get(this.apiUrl, { responseType: 'text' })
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (raw) => {
          const parsed = this.parseArrayResponse<unknown>(raw, 'flights');
          const flights = parsed
            .map((item) => this.normalizeFlight(item))
            .filter((flight): flight is Flight => flight !== null);

          if (parsed.length > 0 && flights.length === 0) {
            console.error('Flights payload received, but no rows matched the expected schema', raw);
          }

          if (parsed.length === 0) {
            console.warn('No flights returned by API');
          }

          this.flightsSubject.next(flights);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to load flights', err);
          const withStatus = err.status ? ` (${err.status})` : '';
          this.errorSubject.next(`Unable to load flights${withStatus}. Please try again.`);
        },
      });
  }

  /** Get flights as observable */
  getFlights(): Observable<Flight[]> {
    return this.flights$;
  }

  /** Force reload flights from backend */
  refreshFlights(): void {
    this.loadFlights();
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
