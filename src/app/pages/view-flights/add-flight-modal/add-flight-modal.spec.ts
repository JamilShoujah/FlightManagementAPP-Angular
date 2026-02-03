import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFlightModal } from './add-flight-modal';

describe('AddFlightModal', () => {
  let component: AddFlightModal;
  let fixture: ComponentFixture<AddFlightModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFlightModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFlightModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
