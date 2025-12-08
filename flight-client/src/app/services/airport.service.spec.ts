import { TestBed } from '@angular/core/testing';

import { Airport } from './airport';

describe('Airport', () => {
  let service: Airport;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Airport);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
