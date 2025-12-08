import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReservationDataService {

  // ✈ 1) Flight Selection
  selectedFlight: any = null;

  // 👤 2) Passenger Info
  passengerInfo: any = null;

  // 💺 3) Seat Selection
  selectedSeat: string | null = null;

  // 🧳 4) Baggage
  baggage: any = null;

  // ➕ 5) Extras (Generic extras — NOT prize)
  extras: any = null;

  // 🎁 BONUS WHEEL RESULT (ASIL ÖDÜL BURADA!)
  extraPrize: { code: string, label: string } | null = null;

  // 💳 6) Payment
  payment: any = null;


  // ======================
  //   SETTERS
  // ======================

  setFlight(flight: any) {
    this.selectedFlight = flight;
  }

  setPassengerInfo(info: any) {
    this.passengerInfo = info;
  }

  setSeat(seat: string) {
    this.selectedSeat = seat;
  }

  setBaggage(bag: any) {
    this.baggage = bag;
  }

  setExtras(ex: any) {
    this.extras = ex;
  }

  setPayment(info: any) {
    this.payment = info;
  }


  // ======================
  //   BONUS WHEEL PRIZE
  // ======================

  /** 🎯 Çarktan çıkan ödülü saklar */
  setExtraPrize(prize: { code: string, label: string }) {
    this.extraPrize = prize;
  }

  /** 🎁 Ödemede ödülü uygulamak için çağırılır */
  getExtraPrize() {
    return this.extraPrize;
  }


  // ======================
  //   FINAL OBJECT
  // ======================
  getFinalReservation() {
    return {
      selectedFlight: this.selectedFlight,
      passengerInfo: this.passengerInfo,
      selectedSeat: this.selectedSeat,
      baggage: this.baggage,
      extras: this.extras,
      bonusPrize: this.extraPrize,    // 🎁 BONUS BURADA EKLENDİ
      payment: this.payment,
    };
  }
}
