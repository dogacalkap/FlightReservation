import { TestBed } from '@angular/core/testing';

import { Seats } from './seats';

describe('Seats', () => {
  let service: Seats;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Seats);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
