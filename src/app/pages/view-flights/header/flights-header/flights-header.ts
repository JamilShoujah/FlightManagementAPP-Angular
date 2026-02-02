import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateDisplayComponent } from '../../../../components/date-display/date-display';

@Component({
  selector: 'app-flights-header',
  templateUrl: './flights-header.html',
  styleUrls: ['./flights-header.scss'],
  standalone: true,
  imports: [DateDisplayComponent],
})
export class FlightsHeader {
  @Input() today!: Date;
  @Input() filteredFlightsLength!: number;
  @Input() hideDeparted!: boolean;

  @Output() toggleHideDepartedEvent = new EventEmitter<void>();

  toggleHideDeparted() {
    this.toggleHideDepartedEvent.emit();
  }
}
