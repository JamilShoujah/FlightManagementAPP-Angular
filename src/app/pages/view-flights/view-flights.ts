import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Flight } from '../../models/flights.model';
import { FlightService } from '../../services/flights.service';

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

  // Settings & Dropdowns
  hideDeparted: boolean = false;
  systemDateStr: string = '';
  minDepartureDate: string = '';

  airlines: string[] = [
    'MEA',
    'Turkish Airlines',
    'Emirates',
    'Qatar Airways',
    'Lufthansa',
    'British Airways',
    'Air France',
    'Singapore Airlines',
    'Delta Airlines',
    'Etihad Airways',
  ];

  foodOptions: string[] = ['Mixed', 'Meat', 'Chicken', 'Fish', 'Vegetable', 'Vegan'];

  constructor(
    private flightService: FlightService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.flightForm = this.fb.group({
      brand: ['', Validators.required],
      planeType: ['', Validators.required],
      crewCount: [null, [Validators.required, Validators.min(1)]],
      seats: [null, [Validators.required, Validators.min(1)]],
      preferredFood: ['', Validators.required],
      arrivalDate: ['', Validators.required],
      departureDate: ['', Validators.required],
      departureTime: ['', Validators.required],
      foodRequested: [{ value: false, disabled: true }],
    });
  }

  ngOnInit(): void {
    this.updateSystemTime();
    this.flightService.getFlights().subscribe((data) => {
      this.flights = data;
      this.sortFlights();
    });
    setInterval(() => this.updateSystemTime(), 60000);
  }

  updateSystemTime() {
    this.today = new Date();
    this.systemDateStr = this.today.toISOString().split('T')[0];
  }

  goBack() {
    this.router.navigate(['/']);
  }

  get filteredFlights(): Flight[] {
    return this.hideDeparted ? this.flights.filter((f) => !this.isDeparted(f)) : this.flights;
  }

  isDeparted(flight: Flight): boolean {
    const departure = new Date(`${flight.departureDate}T${flight.departureTime}`);
    return departure < this.today;
  }

  toggleHideDeparted() {
    this.hideDeparted = !this.hideDeparted;
  }

  onDateChange() {
    const arrival = this.flightForm.get('arrivalDate')?.value;
    const departureControl = this.flightForm.get('departureDate');
    if (arrival) {
      this.minDepartureDate = arrival > this.systemDateStr ? arrival : this.systemDateStr;
      if (departureControl?.value && departureControl.value < this.minDepartureDate) {
        departureControl.setValue(this.minDepartureDate);
      }
    }
    this.checkFoodEligibility();
  }

  checkFoodEligibility() {
    const dDate = this.flightForm.get('departureDate')?.value;
    const dTime = this.flightForm.get('departureTime')?.value;
    const foodControl = this.flightForm.get('foodRequested');

    if (dDate && dTime) {
      const departure = new Date(`${dDate}T${dTime}`);
      if (departure < this.today) {
        this.flightForm.get('departureTime')?.setErrors({ past: true });
      }
      const limit = new Date(this.today.getTime() + 24 * 60 * 60 * 1000);
      if (departure < limit) {
        foodControl?.setValue(false);
        foodControl?.disable();
      } else {
        foodControl?.enable();
      }
    }
  }

  private sortFlights() {
    this.flights.sort((a, b) => {
      const timeA = new Date(`${a.departureDate}T${a.departureTime}`).getTime();
      const timeB = new Date(`${b.departureDate}T${b.departureTime}`).getTime();
      return timeA - timeB;
    });
  }

  onSubmit() {
    if (this.flightForm.invalid) return;
    const newFlight: Flight = { ...this.flightForm.getRawValue(), id: Date.now() };
    this.flightService.addFlight(newFlight);
    this.sortFlights();
    this.closeModal();
  }

  openModal() {
    this.isModalOpen = true;
    this.minDepartureDate = this.systemDateStr;
  }
  closeModal() {
    this.isModalOpen = false;
    this.flightForm.reset({ brand: '', preferredFood: '', foodRequested: false });
  }
}
