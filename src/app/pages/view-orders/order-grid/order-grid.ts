import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderStatus } from '../../../models/order.models';
import { FlightWithOrder } from '../../../models/flight-with-order';

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

  // Template methods
  onEdit(flightId: number) {
    this.editOrder.emit(flightId);
  }

  onStatusChange(flightId: number, event: Event) {
    const select = event.target as HTMLSelectElement | null;
    if (!select) return; // safely handle null
    const newStatus = select.value as OrderStatus;

    if (newStatus !== 'PENDING' && newStatus !== 'COMPLETE') return;

    this.statusChange.emit({ flightId, status: newStatus });
  }
}
