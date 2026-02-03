import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlightWithOrder } from '../../../models/flight&order.model';
import { OrderedFoodItem } from '../../../models/order.models';

@Component({
  selector: 'app-edit-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-order-modal.html',
  styleUrls: ['./edit-order-modal.scss'],
})
export class EditOrderModalComponent implements OnChanges {
  @Input() flight: FlightWithOrder | null = null;
  @Input() foodOptions: { id: number; name: string; type: string }[] = [];
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<OrderedFoodItem[]>();

  orderQuantities: Record<number, number> = {};
  currentTotal = signal(0);
  remainingSeats = signal(0);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['flight'] && this.flight) {
      // Initialize quantities from the flight's orderInfo
      this.orderQuantities = {};
      this.foodOptions.forEach((opt) => {
        this.orderQuantities[opt.id] =
          this.flight!.orderInfo.itemsRequested.find((i) => i.foodId === opt.id)?.quantity || 0;
      });
      this.recalculateTotals();
    }
  }

  onQuantityChange() {
    this.recalculateTotals();
  }

  recalculateTotals() {
    const total = Object.values(this.orderQuantities).reduce((sum, q) => sum + (q || 0), 0);
    this.currentTotal.set(total);
    const seats = this.flight?.seats || 0;
    this.remainingSeats.set(seats - total);
  }

  onSave() {
    if (!this.flight) return;

    const items: OrderedFoodItem[] = Object.entries(this.orderQuantities)
      .map(([foodId, quantity]) => ({ foodId: Number(foodId), quantity }))
      .filter((i) => i.quantity > 0);

    this.save.emit(items);
  }
}
