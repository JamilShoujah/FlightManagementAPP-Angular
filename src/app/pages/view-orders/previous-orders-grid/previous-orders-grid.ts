import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FOODOPTIONS } from '../../../constants/food.constant';

@Component({
  selector: 'app-previous-orders-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './previous-orders-grid.html',
  styleUrls: ['./previous-orders-grid.scss'],
})
export class PreviousOrdersGridComponent {
  @Input() orders: any[] = [];

  foodMap: Record<number, string> = Object.fromEntries(FOODOPTIONS.map((f) => [f.id, f.name]));

  getFoodName(foodId: number): string {
    return this.foodMap[foodId] || '';
  }
}
