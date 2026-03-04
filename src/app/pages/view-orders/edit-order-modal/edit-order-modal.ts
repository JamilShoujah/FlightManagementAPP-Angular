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
import { OrderedFoodItem } from '../../../models/order.models';
import { FlightWithOrder } from '../../../models/flight-with-order';

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

  private resolveItemFoodId(item: OrderedFoodItem): number | undefined {
    return item.foodId ?? item.foodOption?.id ?? item.id;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['flight'] && this.flight) {
      // Initialize quantities from the flight's orderInfo
      this.orderQuantities = {};

      // Only proceed if orderInfo exists
      const items = this.flight.orderInfo?.itemsRequested ?? [];

      this.foodOptions.forEach((opt) => {
        // Find quantity from the order, default to 0 if not found or orderInfo is null
        const orderedItem = items.find((i) => this.resolveItemFoodId(i) === opt.id);
        this.orderQuantities[opt.id] = orderedItem?.quantity ?? 0;
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
      .filter(([_, quantity]) => quantity > 0)
      .map(([foodId, quantity]) => {
        const food = this.foodOptions.find((f) => f.id === Number(foodId));

        return {
          foodId: food!.id,
          name: food!.name,
          quantity: quantity as number,
        };
      });

    this.save.emit(items);
  }
}
