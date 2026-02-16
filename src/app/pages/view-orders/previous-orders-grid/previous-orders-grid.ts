import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FOODOPTIONS } from '../../../constants/food.constant';
import { FlightWithOrder } from '../../../models/flight-with-order';
import { OrderedFoodItem } from '../../../models/order.models';

type PreviousOrderItem = OrderedFoodItem & { foodId?: number };

@Component({
  selector: 'app-previous-orders-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './previous-orders-grid.html',
  styleUrls: ['./previous-orders-grid.scss'],
})
export class PreviousOrdersGridComponent {
  @Input() orders: FlightWithOrder[] = [];

  foodMap: Record<number, string> = Object.fromEntries(FOODOPTIONS.map((f) => [f.id, f.name]));

  getFoodName(foodId: number | null | undefined): string {
    if (foodId == null) return '';
    return this.foodMap[foodId] || '';
  }

  getItemFoodId(item: PreviousOrderItem): number | undefined {
    return item.foodId ?? item.foodOption?.id ?? item.id;
  }

  trackByFlightId(_: number, flight: FlightWithOrder): number {
    return flight.id;
  }

  trackByItemId(index: number, item: PreviousOrderItem): number {
    return item.foodId ?? item.foodOption?.id ?? item.id ?? index;
  }
}
