import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightService } from '../../services/flights.service';
import { Flight } from '../../models/flights.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-view-flights',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-flights.html',
  styleUrls: ['./view-flights.scss'],
})
export class ViewFlights implements OnInit {
  flights: Flight[] = [];
  isModalOpen = false;
  flightForm: FormGroup;
  today: Date = new Date();
  minDepartureDate: string = '';

  constructor(
    private flightService: FlightService,
    private fb: FormBuilder,
  ) {
    this.flightForm = this.fb.group({
      brand: ['', Validators.required],
      planeType: ['', Validators.required],
      crewCount: [null, [Validators.required, Validators.min(1)]],
      seats: [null, [Validators.required, Validators.min(1)]],
      preferredFood: ['', Validators.required],
      departureDate: ['', Validators.required],
      departureTime: ['', Validators.required],
      arrivalDate: ['', Validators.required],
      foodRequested: [{ value: false, disabled: false }],
    });
  }

  ngOnInit(): void {
    this.updateSystemTime();
    this.flightService.getFlights().subscribe((data) => {
      this.flights = data;
      this.sortFlights();
    });

    this.minDepartureDate = new Date().toISOString().split('T')[0];
    setInterval(() => this.updateSystemTime(), 60000);
  }

  updateSystemTime() {
    this.today = new Date();
  }

  private sortFlights() {
    this.flights.sort((a, b) => {
      const timeA = new Date(`${a.departureDate}T${a.departureTime}`).getTime();
      const timeB = new Date(`${b.departureDate}T${b.departureTime}`).getTime();
      return timeA - timeB;
    });
  }

  checkFoodEligibility() {
    const dDate = this.flightForm.get('departureDate')?.value;
    const dTime = this.flightForm.get('departureTime')?.value;

    if (dDate && dTime) {
      const departure = new Date(`${dDate}T${dTime}`);
      const limit = new Date(this.today.getTime() + 24 * 60 * 60 * 1000);
      const foodControl = this.flightForm.get('foodRequested');

      if (departure < limit) {
        foodControl?.setValue(false);
        foodControl?.disable();
      } else {
        foodControl?.enable();
      }
    }
  }

  onSubmit() {
    if (this.flightForm.invalid) return;

    const arrival = new Date(this.flightForm.value.arrivalDate);
    const departureDay = new Date(this.flightForm.value.departureDate);

    if (arrival < departureDay) {
      alert('Error: Arrival date cannot be earlier than the departure date.');
      return;
    }

    const newFlight: Flight = {
      ...this.flightForm.getRawValue(),
      id: this.flights.length > 0 ? Math.max(...this.flights.map((f) => f.id)) + 1 : 1,
    };

    this.flightService.addFlight(newFlight);
    this.sortFlights();
    this.closeModal();
  }

  openModal() {
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
    this.flightForm.reset({ foodRequested: false });
  }
}
