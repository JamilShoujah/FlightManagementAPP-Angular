import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flight } from '../../../models/flights.model';

@Component({
  selector: 'app-flights-table',
  templateUrl: './flights-table.html',
  styleUrls: ['./flights-table.scss'],
  standalone: true,
  imports: [CommonModule,],
})
export class FlightsTableComponent {
  @Input() filteredFlights: Flight[] = [];
  @Input() hideDeparted = false;
  @Input() today: Date = new Date(); // parent passes the current date

  // check if a flight has departed
  isDeparted(flight: Flight): boolean {
    const departure = new Date(`${flight.departureDate}T${flight.departureTime}`);
    return departure < this.today;
  }

  // only show flights depending on hideDeparted flag
  get displayedFlights(): Flight[] {
    return this.hideDeparted
      ? this.filteredFlights.filter((f) => !this.isDeparted(f))
      : this.filteredFlights;
  }
}
