import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-date-display',
  templateUrl: './date-display.html',
  styleUrls: ['./date-display.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe], // DatePipe for | date
})
export class DateDisplayComponent {
  @Input() date!: Date; // parent will pass today
}
