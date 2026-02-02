import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateDisplay } from './date-display';

describe('DateDisplay', () => {
  let component: DateDisplay;
  let fixture: ComponentFixture<DateDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
