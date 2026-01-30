import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Flight } from '../../models/flights.model';
import { FlightService } from '../../services/flights.service';
import { AIRLINES } from '../../constants/brand.constant';
import { FOODOPTIONS } from '../../constants/food.constant';

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
  hideDeparted = false;

  today: Date = new Date();
  systemDateStr = '';
  minDepartureDate = '';

  airlines = AIRLINES;

  // unique food types + Any
  foodTypes: string[] = [...Array.from(new Set(FOODOPTIONS.map((f) => f.type))), 'Any'];

  flightForm: FormGroup;

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

      foodRequested: [false],
      preferredFood: [{ value: '', disabled: true }], // ✅ FIXED (no validator here)

      arrivalDate: ['', Validators.required],
      departureDate: ['', Validators.required],
      departureTime: ['', Validators.required],
    });
  }

  // =====================
  // Lifecycle
  // =====================
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

  // =====================
  // Navigation
  // =====================
  goBack() {
    this.router.navigate(['/']);
  }

  // =====================
  // Table helpers
  // =====================
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

  // =====================
  // Date & food logic
  // =====================
  onDateChange() {
    const arrival = this.flightForm.get('arrivalDate')!.value;
    const departureCtrl = this.flightForm.get('departureDate')!;

    if (arrival) {
      this.minDepartureDate = arrival > this.systemDateStr ? arrival : this.systemDateStr;

      if (departureCtrl.value && departureCtrl.value < this.minDepartureDate) {
        departureCtrl.setValue(this.minDepartureDate);
      }
    }

    this.checkFoodEligibility();
  }

  checkFoodEligibility() {
    const dDate = this.flightForm.get('departureDate')!.value;
    const dTime = this.flightForm.get('departureTime')!.value;
    const foodRequestedCtrl = this.flightForm.get('foodRequested')!;
    const preferredFoodCtrl = this.flightForm.get('preferredFood')!;

    if (!dDate || !dTime) return;

    const departure = new Date(`${dDate}T${dTime}`);
    const limit = new Date(this.today.getTime() + 24 * 60 * 60 * 1000);

    // ❌ less than 24h → food not allowed
    if (departure < limit) {
      foodRequestedCtrl.setValue(false);
      preferredFoodCtrl.clearValidators();
      preferredFoodCtrl.setValue('');
      preferredFoodCtrl.disable();
      preferredFoodCtrl.updateValueAndValidity();
    }
  }

  onFoodToggle() {
    const preferredFoodCtrl = this.flightForm.get('preferredFood')!;
    const foodRequested = this.flightForm.get('foodRequested')!.value;

    if (foodRequested) {
      preferredFoodCtrl.setValidators([Validators.required]);
      preferredFoodCtrl.enable();
    } else {
      preferredFoodCtrl.clearValidators();
      preferredFoodCtrl.setValue('');
      preferredFoodCtrl.disable();
    }

    preferredFoodCtrl.updateValueAndValidity();
  }

  // =====================
  // Modal
  // =====================
  openModal() {
    this.isModalOpen = true;
    this.minDepartureDate = this.systemDateStr;
  }

  closeModal() {
    this.isModalOpen = false;
    this.flightForm.reset({
      brand: '',
      planeType: '',
      crewCount: null,
      seats: null,
      foodRequested: false,
      preferredFood: '',
      arrivalDate: '',
      departureDate: '',
      departureTime: '',
    });
  }

  // =====================
  // Submit
  // =====================
  onSubmit() {
    if (this.flightForm.invalid) return;

    const newFlight: Flight = {
      id: Date.now(),
      ...this.flightForm.getRawValue(), // ✅ includes disabled preferredFood
    };

    this.flightService.addFlight(newFlight);
    this.sortFlights();
    this.closeModal();
  }

  private sortFlights() {
    this.flights.sort((a, b) => {
      const aTime = new Date(`${a.departureDate}T${a.departureTime}`).getTime();
      const bTime = new Date(`${b.departureDate}T${b.departureTime}`).getTime();
      return aTime - bTime;
    });
  }
}
