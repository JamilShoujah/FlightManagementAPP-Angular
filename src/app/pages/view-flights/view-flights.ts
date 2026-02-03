import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Flight } from '../../models/flights.model';
import { FlightService } from '../../services/flights.service';
import { AIRLINES } from '../../constants/brand.constant';
import { FOODOPTIONS } from '../../constants/food.constant';
import { FlightsHeader } from './header/flights-header/flights-header';
import { BackButton } from '../../components/back-button/back-button';
import { FlightsTableComponent } from './flights-table/flights-table';
import { AddFlightModalComponent } from './add-flight-modal/add-flight-modal';

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
  hideDeparted = false;

  today: Date = new Date();
  systemDateStr = '';

  airlines = AIRLINES;
  foodTypes = [...new Set(FOODOPTIONS.map((f) => f.type)), 'Any'];

  constructor(private flightService: FlightService) {}

  ngOnInit(): void {
    this.updateSystemTime();
    this.flightService.getFlights().subscribe((flights) => {
      this.flights = flights;
      this.sortFlights();
    });
    setInterval(() => this.updateSystemTime(), 60000);
  }

  updateSystemTime() {
    this.today = new Date();
    this.systemDateStr = this.today.toISOString().split('T')[0];
  }

  // Modal
  openModal() {
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
  }

  // Flights table
  get filteredFlights(): Flight[] {
    return this.hideDeparted ? this.flights.filter((f) => !this.isDeparted(f)) : this.flights;
  }
  isDeparted(flight: Flight): boolean {
    return new Date(`${flight.departureDate}T${flight.departureTime}`) < this.today;
  }
  toggleHideDeparted() {
    this.hideDeparted = !this.hideDeparted;
  }

  // Submit new flight
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
