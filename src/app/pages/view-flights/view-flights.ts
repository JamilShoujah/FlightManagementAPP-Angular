// src/app/pages/view-flights/view-flights.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightService } from '../../services/flights.service';
import { Flight } from '../../models/flights.model';
import { AsyncPipe, NgFor } from '@angular/common';

@Component({
  selector: 'app-view-flights',
  standalone: true,
  imports: [CommonModule, NgFor, AsyncPipe],
  templateUrl: './view-flights.html',
  styleUrls: ['./view-flights.scss'],
})
export class ViewFlights implements OnInit {
  flights: Flight[] = [];

  constructor(private flightService: FlightService) {}

  ngOnInit(): void {
    this.flightService.getFlights().subscribe((data) => {
      this.flights = data;
    });
  }
}
