import { TestBed } from '@angular/core/testing';

import { AirportLookup } from './airport-lookup';

describe('AirportLookup', () => {
  let service: AirportLookup;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirportLookup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
