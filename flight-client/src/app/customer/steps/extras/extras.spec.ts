import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Extras } from './extras';

describe('Extras', () => {
  let component: Extras;
  let fixture: ComponentFixture<Extras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Extras]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Extras);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
