import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatAvailability } from './seat-availability';

describe('SeatAvailability', () => {
  let component: SeatAvailability;
  let fixture: ComponentFixture<SeatAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatAvailability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatAvailability);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
