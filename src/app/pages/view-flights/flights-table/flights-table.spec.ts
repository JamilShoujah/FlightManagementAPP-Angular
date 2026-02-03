import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightsTable } from './flights-table';

describe('FlightsTable', () => {
  let component: FlightsTable;
  let fixture: ComponentFixture<FlightsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
