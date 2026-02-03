import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingOrdersGridComponent } from './order-grid';

describe('OrderGrid', () => {
  let component: UpcomingOrdersGridComponent;
  let fixture: ComponentFixture<UpcomingOrdersGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingOrdersGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingOrdersGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
