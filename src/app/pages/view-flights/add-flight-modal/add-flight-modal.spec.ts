import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFlightModalComponent } from './add-flight-modal';

describe('AddFlightModal', () => {
  let component: AddFlightModalComponent;
  let fixture: ComponentFixture<AddFlightModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFlightModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddFlightModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
