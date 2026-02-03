import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderStatus } from '../../../models/order.models';
import { FlightWithOrder } from '../../../models/flight&order.model';

@Component({
  selector: 'app-upcoming-orders-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-grid.html',
  styleUrls: ['./order-grid.scss'],
})
export class UpcomingOrdersGridComponent {
  // Inputs from parent
  @Input() upcomingOrders: FlightWithOrder[] = [];
  @Input() getFoodName!: (foodId: number) => string;

  // Outputs to parent
  @Output() editOrder = new EventEmitter<number>();
  @Output() statusChange = new EventEmitter<{ flightId: number; status: OrderStatus }>();
  @Output() openModal = new EventEmitter<void>();

  // Template methods
  onEdit(flightId: number) {
    this.editOrder.emit(flightId);
    this.openModal.emit();
  }

  onStatusChange(flightId: number, status: OrderStatus) {
    this.statusChange.emit({ flightId, status });
  }
}
