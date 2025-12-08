import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeatAvailabilityComponent } from '../steps/seat-availability/seat-availability.component';
import { PassengerInfoComponent } from '../steps/passenger-info/passenger-info.component';
import { SeatSelectionComponent } from '../steps/seat-selection/seat-selection.component';
import { BaggageComponent } from '../steps/baggage/baggage.component';
import { ExtrasComponent } from '../steps/extras/extras.component';
import { PaymentComponent } from '../steps/payment/payment.component';

import { ReservationStepsService } from '../../services/reservation-steps.service';
import { StepKey } from '../../types/step-key';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SeatAvailabilityComponent,
    PassengerInfoComponent,
    SeatSelectionComponent,
    BaggageComponent,
    ExtrasComponent,
    PaymentComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class CustomerHomeComponent implements OnInit {

  backgroundImage: string = '';

  // search form için kullanılan property’ler
  airports: any[] = [];          // *ngFor="let a of airports"
  fromAirportId: number | null = null;
  toAirportId: number | null = null;
  selectedDate: string | null = null;
  flightClass: string = 'Economy';

  // sonuç tablosu için
  searched: boolean = false;
  filteredFlights: any[] = [];

  constructor(public stepService: ReservationStepsService) {}

  ngOnInit(): void {
    this.setBackgroundBasedOnTime();
    // TODO: airports’ü backend’den dolduracağın servis çağrısını buraya koy
    // this.airportsService.getAll().subscribe(a => this.airports = a);
  }

  setBackgroundBasedOnTime(): void {
  
  }

  // search butonunun çağırdığı fonksiyon
  searchFlights(): void {
    this.searched = true;
    // TODO: backend’e isteğini burada atıp filteredFlights’i doldur
    // örnek: this.flightService.search(...).subscribe(f => this.filteredFlights = f);
  }

  // Select butonunun çağırdığı fonksiyon
  selectFlight(f: any): void {
    // TODO: seçilen uçuşu stepService’e veya başka bir servise koy
    // sonra bir sonraki stepe geç
    // this.stepService.setSelectedFlight(f);
    // this.stepService.setActiveStep('passenger-info');
  }

  steps = [
    { key: 'seat-status',    serviceKey: 'seatAvailability' as StepKey, label: 'Seat Availability', icon: 'bi-check-circle' },
    { key: 'passenger-info', serviceKey: 'passengerInfo' as StepKey,    label: 'Passenger Info',    icon: 'bi-person-vcard' },
    { key: 'seat-selection', serviceKey: 'seatSelection' as StepKey,    label: 'Seat Selection',    icon: 'bi-grid-3x3-gap' },
    { key: 'baggage',        serviceKey: 'baggage' as StepKey,          label: 'Baggage',           icon: 'bi-bag' },
    { key: 'extras',         serviceKey: 'extras' as StepKey,           label: 'Extras',            icon: 'bi-plus-circle' },
    { key: 'payment',        serviceKey: 'payment' as StepKey,          label: 'Payment',           icon: 'bi-credit-card' }
  ];

  get activeStepKey() {
    return this.stepService.activeStep;
  }

  tryGoToStep(step: any) {
    const order = [
      'seat-status',
      'passenger-info',
      'seat-selection',
      'baggage',
      'extras',
      'payment'
    ];

    const index = order.indexOf(step.key);

    if (index > 0) {
      const previousKey = order[index - 1];
      const previousServiceKey = this.steps.find(s => s.key === previousKey)!.serviceKey;

      if (!this.stepService.steps[previousServiceKey]) {
        alert('Please complete the previous steps first.');
        return;
      }
    }

    this.stepService.setActiveStep(step.key);
  }

  stepComponents: Record<string, any> = {
    'seat-status': SeatAvailabilityComponent,
    'passenger-info': PassengerInfoComponent,
    'seat-selection': SeatSelectionComponent,
    'baggage': BaggageComponent,
    'extras': ExtrasComponent,
    'payment': PaymentComponent
  };
}