import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrders } from './view-orders';

describe('ViewOrders', () => {
  let component: ViewOrders;
  let fixture: ComponentFixture<ViewOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOrders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOrders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
