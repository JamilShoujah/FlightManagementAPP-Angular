import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderTab } from '../../../constants/ordertab.constant';

@Component({
  selector: 'app-order-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.scss'],
})
export class TabsComponent {
  @Input() activeTab: OrderTab = 'upcoming';
  @Output() activeTabChange = new EventEmitter<OrderTab>();

  setTab(tab: OrderTab) {
    this.activeTab = tab;
    this.activeTabChange.emit(tab);
  }
}
