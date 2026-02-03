import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightsHeader } from './flights-header';

describe('FlightsHeader', () => {
  let component: FlightsHeader;
  let fixture: ComponentFixture<FlightsHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightsHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightsHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
