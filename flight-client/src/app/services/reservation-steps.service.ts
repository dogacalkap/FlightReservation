import { Injectable } from '@angular/core';
import { StepKey } from '../types/step-key';

@Injectable({
  providedIn: 'root'
})
export class ReservationStepsService {

  // -----------------------------
  // STEP DURUMLARI
  // -----------------------------
  activeStep: StepKey = 'seatAvailability';

  steps: Record<StepKey, boolean> = {
    seatAvailability: false,
    passengerInfo: false,
    seatSelection: false,
    baggage: false,
    extras: false,
    payment: false
  };

  stepRoutes: Record<StepKey, string> = {
    seatAvailability: 'seat-availability',
    passengerInfo: 'passenger-info',
    seatSelection: 'seat-selection',
    baggage: 'baggage',
    extras: 'extras',
    payment: 'payment'
  };

  setActiveStep(step: StepKey) {
    this.activeStep = step;
  }

  completeStep(step: StepKey) {
    this.steps[step] = true;
  }

  getStepRoute(step: StepKey): string {
    return this.stepRoutes[step];
  }

  resetSteps() {
    this.steps = {
      seatAvailability: false,
      passengerInfo: false,
      seatSelection: false,
      baggage: false,
      extras: false,
      payment: false
    };
  }

  // -----------------------------
  // 🔥 REZERVASYONU TAMAMEN SIFIRLAYAN METOT
  // -----------------------------
  resetAll() {
    // 1) Step reset
    this.activeStep = 'seatAvailability';
    this.steps = {
      seatAvailability: false,
      passengerInfo: false,
      seatSelection: false,
      baggage: false,
      extras: false,
      payment: false
    };

    // 2) Reservation data reset
    this.selectedFlight = null;
    this.passengerInfo = null;
    this.seatSelection = null;
    this.baggage = null;
    this.extras = [];

    console.log("Rezervasyon tamamen sıfırlandı.");
  }

  // -----------------------------
  // REZERVASYON VERILERI
  // -----------------------------

  // 1) Uçuş bilgisi
  selectedFlight: any = null;  // { from, to, date, basePrice }

  // 2) Yolcu bilgisi
  passengerInfo: {
    userId: number;
    name?: string;
    email?: string;
  } | null = null;

  // 3) Koltuk seçimi
  seatSelection: {
    seatNumber: string;
    price: number;
  } | null = null;

  // 4) Bagaj seçimi
  baggage: {
    weight: number;
    price: number;
  } | null = null;

  // 5) Ekstralar
  extras: Array<{ name: string; price: number; code: string }> = [];

  // -----------------------------
  // FİYAT HESAPLAMA
  // -----------------------------
  getTotalPrice(): number {
    let total = 0;

    if (this.selectedFlight?.basePrice)
      total += this.selectedFlight.basePrice;

    if (this.seatSelection?.price)
      total += this.seatSelection.price;

    if (this.baggage?.price)
      total += this.baggage.price;

    if (this.extras?.length > 0)
      total += this.extras.reduce((sum, e) => sum + e.price, 0);

    return total;
  }
}
