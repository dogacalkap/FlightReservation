import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Baggage } from './baggage';

describe('Baggage', () => {
  let component: Baggage;
  let fixture: ComponentFixture<Baggage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Baggage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Baggage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
