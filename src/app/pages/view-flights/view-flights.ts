import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

import { Flight } from '../../models/flights.model';
import { FlightService } from '../../services/flights.service';
import { AIRLINES } from '../../constants/brand.constant';
import { FOODTYPESARRAY } from '../../constants/food.constant';
import { FlightsHeader } from './header/flights-header/flights-header';
import { BackButton } from '../../components/back-button/back-button';
import { FlightsTableComponent } from './flights-table/flights-table';
import { AddFlightModalComponent } from './add-flight-modal/add-flight-modal';
import { ClockService } from '../../services/clock.service';

@Component({
  selector: 'app-view-flights',
  standalone: true,
  imports: [
    CommonModule,
    FlightsHeader,
    BackButton,
    FlightsTableComponent,
    AddFlightModalComponent,
  ],
  templateUrl: './view-flights.html',
  styleUrls: ['./view-flights.scss'],
})
export class ViewFlights implements OnInit, OnDestroy {
  flights: Flight[] = [];
  isModalOpen = false;
  isLoading = true;
  loadError: string | null = null;
  skeletonRows = Array.from({ length: 8 }, (_, index) => index);

  hideDeparted = false;
  today$!: Observable<Date>; // 🚀 now reactive
  private subscriptions = new Subscription();

  airlines = AIRLINES;
  foodTypes = FOODTYPESARRAY;

  constructor(
    private flightService: FlightService,
    private clockService: ClockService,
  ) {}

  ngOnInit(): void {
    // Subscribe to clock observable
    this.today$ = this.clockService.now$;

    this.subscriptions.add(
      this.flightService.loading$.subscribe((loading) => {
        this.isLoading = loading;
      }),
    );

    this.subscriptions.add(
      this.flightService.error$.subscribe((error) => {
        this.loadError = error;
      }),
    );

    this.subscriptions.add(
      this.flightService.getFlights().subscribe((flights) => {
        this.flights = flights;
        this.sortFlights();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /** Modal */
  openModal() {
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
  }

  /** Filtered flights for table */
  filteredFlights(today: Date): Flight[] {
    return this.hideDeparted
      ? this.flights.filter((f) => !this.isDeparted(f, today))
      : this.flights;
  }

  isDeparted(flight: Flight, today: Date): boolean {
    return new Date(`${flight.departureDate}T${flight.departureTime}`) < today;
  }

  toggleHideDeparted(value: boolean) {
    this.hideDeparted = value;
  }

  retryLoadFlights() {
    this.flightService.refreshFlights();
  }

  onSubmit(flight: Flight) {
    this.flightService.addFlight(flight).subscribe({
      next: (addedFlight) => {
        this.sortFlights();
        this.closeModal();
      },
      error: (err) => console.error('Failed to add flight', err),
    });
  }

  private sortFlights() {
    this.flights.sort(
      (a, b) =>
        new Date(`${a.departureDate}T${a.departureTime}`).getTime() -
        new Date(`${b.departureDate}T${b.departureTime}`).getTime(),
    );
  }
}
