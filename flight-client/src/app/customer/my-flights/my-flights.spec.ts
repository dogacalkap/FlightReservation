import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFlights } from './my-flights';

describe('MyFlights', () => {
  let component: MyFlights;
  let fixture: ComponentFixture<MyFlights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyFlights]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyFlights);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
