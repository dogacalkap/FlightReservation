import { TestBed } from '@angular/core/testing';

import { ReservationSteps } from './reservation-steps';

describe('ReservationSteps', () => {
  let service: ReservationSteps;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservationSteps);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
