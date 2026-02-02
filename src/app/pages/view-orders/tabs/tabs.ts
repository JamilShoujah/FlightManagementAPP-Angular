import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.scss'],
})
export class TabsComponent {
  @Input() activeTab: 'upcoming' | 'previous' = 'upcoming';
  @Output() activeTabChange = new EventEmitter<'upcoming' | 'previous'>();

  setTab(tab: 'upcoming' | 'previous') {
    this.activeTab = tab;
    this.activeTabChange.emit(tab);
  }
}
