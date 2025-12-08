import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerInfo } from './passenger-info';

describe('PassengerInfo', () => {
  let component: PassengerInfo;
  let fixture: ComponentFixture<PassengerInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
