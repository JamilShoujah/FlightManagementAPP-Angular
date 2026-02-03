import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOrderModalComponent } from './edit-order-modal';

describe('EditOrderModal', () => {
  let component: EditOrderModalComponent;
  let fixture: ComponentFixture<EditOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditOrderModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditOrderModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
