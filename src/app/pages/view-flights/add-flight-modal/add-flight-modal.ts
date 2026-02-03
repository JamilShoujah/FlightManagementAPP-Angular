import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Flight } from '../../../models/flights.model';

@Component({
  selector: 'app-add-flight-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-flight-modal.html',
  styleUrls: ['./add-flight-modal.scss'],
})
export class AddFlightModalComponent {
  @Input() isModalOpen = false;
  @Input() airlines: string[] = [];
  @Input() foodTypes: string[] = [];
  @Input() today!: Date;
  @Input() systemDateStr = '';

  @Output() close = new EventEmitter<void>();
  @Output() submitFlight = new EventEmitter<Flight>();

  flightForm: FormGroup;
  minDepartureDate = '';

  constructor(private fb: FormBuilder) {
    this.flightForm = this.fb.group({
      brand: ['', Validators.required],
      planeType: ['', Validators.required],
      crewCount: [null, [Validators.required, Validators.min(1)]],
      seats: [null, [Validators.required, Validators.min(1)]],

      foodRequested: [false],
      preferredFood: [{ value: '', disabled: true }],

      arrivalDate: ['', Validators.required],
      departureDate: ['', Validators.required],
      departureTime: ['', Validators.required],
    });
  }

  /** Update min departure date and check food eligibility */
  onDateChange() {
    const arrival = this.flightForm.get('arrivalDate')!.value;
    const departureCtrl = this.flightForm.get('departureDate')!;

    if (!arrival) return;

    this.minDepartureDate = arrival > this.systemDateStr ? arrival : this.systemDateStr;

    if (departureCtrl.value && departureCtrl.value < this.minDepartureDate) {
      departureCtrl.setValue(this.minDepartureDate);
    }

    this.checkFoodEligibility();
  }

  /** Disable food if departure < 24h */
  checkFoodEligibility() {
    const dDate = this.flightForm.get('departureDate')!.value;
    const dTime = this.flightForm.get('departureTime')!.value;

    if (!dDate || !dTime) return;

    const departure = new Date(`${dDate}T${dTime}`);
    const limit = new Date(this.today.getTime() + 24 * 60 * 60 * 1000);

    const foodRequestedCtrl = this.flightForm.get('foodRequested')!;
    const preferredFoodCtrl = this.flightForm.get('preferredFood')!;

    if (departure < limit) {
      foodRequestedCtrl.setValue(false);
      preferredFoodCtrl.clearValidators();
      preferredFoodCtrl.setValue('');
      preferredFoodCtrl.disable();
    } else if (foodRequestedCtrl.value) {
      preferredFoodCtrl.setValidators([Validators.required]);
      preferredFoodCtrl.enable();
    }

    preferredFoodCtrl.updateValueAndValidity();
  }

  /** Toggle preferredFood validators */
  onFoodToggle() {
    const foodRequestedCtrl = this.flightForm.get('foodRequested')!;
    const preferredFoodCtrl = this.flightForm.get('preferredFood')!;

    if (foodRequestedCtrl.value) {
      preferredFoodCtrl.setValidators([Validators.required]);
      preferredFoodCtrl.enable();
    } else {
      preferredFoodCtrl.clearValidators();
      preferredFoodCtrl.setValue('');
      preferredFoodCtrl.disable();
    }

    preferredFoodCtrl.updateValueAndValidity();
  }

  /** Submit flight */
  submit() {
    if (this.flightForm.invalid) return;

    const newFlight: Flight = {
      id: Date.now(),
      ...this.flightForm.getRawValue(),
    };

    this.submitFlight.emit(newFlight);
    this.closeModal();
  }

  /** Close modal and reset form */
  closeModal() {
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

    this.close.emit();
  }

  /** Ensure number inputs are real numbers */
  onNumberInput(controlName: string, event: Event) {
    const input = event.target as HTMLInputElement;
    this.flightForm.get(controlName)!.setValue(input.valueAsNumber);
  }
}
