import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousOrdersGrid } from './previous-orders-grid';

describe('PreviousOrdersGrid', () => {
  let component: PreviousOrdersGrid;
  let fixture: ComponentFixture<PreviousOrdersGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousOrdersGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviousOrdersGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
