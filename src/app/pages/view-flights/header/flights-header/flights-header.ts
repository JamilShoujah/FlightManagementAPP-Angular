import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  // Emit the new value to the parent
  @Output() toggleHideDepartedEvent = new EventEmitter<boolean>();

  setHideDeparted(value: boolean) {
    if (this.hideDeparted !== value) {
      this.toggleHideDepartedEvent.emit(value);
    }
  }
}
