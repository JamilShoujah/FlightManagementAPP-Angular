import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

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
export class ViewFlights implements OnInit {
  flights: Flight[] = [];
  isModalOpen = false;

  hideDeparted = true;
  today$!: Observable<Date>; // 🚀 now reactive

  airlines = AIRLINES;
  foodTypes = FOODTYPESARRAY;

  constructor(
    private flightService: FlightService,
    private clockService: ClockService,
  ) {}

  ngOnInit(): void {
    // Subscribe to clock observable
    this.today$ = this.clockService.now$;

    this.flightService.getFlights().subscribe((flights) => {
      this.flights = flights;
      this.sortFlights();
    });
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

  onSubmit(flight: Flight) {
    this.flightService.addFlight(flight);
    this.sortFlights();
    this.closeModal();
  }

  private sortFlights() {
    this.flights.sort(
      (a, b) =>
        new Date(`${a.departureDate}T${a.departureTime}`).getTime() -
        new Date(`${b.departureDate}T${b.departureTime}`).getTime(),
    );
  }
}
