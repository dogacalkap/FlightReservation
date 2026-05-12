import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Airport } from '../../../models/airport';
import { Flight } from '../../../models/flight';

import { AirportService } from '../../../services/airport.service';
import { CustomerFlightService } from '../../../services/customer-flight.service';
import { Router } from '@angular/router';
import { ReservationStepsService } from '../../../services/reservation-steps.service';
import { ReservationDataService } from '../../../services/reservation-data.service';
import { TranslatePipe } from '../../../shared/translate.pipe';

@Component({
  selector: 'app-seat-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TranslatePipe],
  templateUrl: './seat-availability.component.html',
  styleUrls: ['./seat-availability.component.css']
})
export class SeatAvailabilityComponent implements OnInit {
  @Input() redirectToCustomer = false; // Landing'de kullanırken otomatik müşteri akışına geç

  airports: Airport[] = [];
  allFlights: Flight[] = [];
  filteredFlights: any[] = [];

  // UI flags
  searched = false;
  showFillWarning = false;
  showNoFlightsWarning = false;

  // form fields
  fromAirportId: number | null = null;
  toAirportId: number | null = null;
  selectedDate: string = '';

  travelClass: string = 'economy';
  extraPrice = 0;
  passengerCount: number = 1;

  constructor(
    private airportService: AirportService,
    private flightService: CustomerFlightService,
    private router: Router,
    public stepService: ReservationStepsService,
    private dataService: ReservationDataService
  ) {}
  
  ngOnInit(): void {
    this.restoreState();
    this.loadAirports();
    this.loadFlights();
  }

  private restoreState() {
    const criteria = this.stepService.searchCriteria;
    if (!criteria) {
      return;
    }

    this.fromAirportId = criteria.fromAirportId;
    this.toAirportId = criteria.toAirportId;
    this.selectedDate = criteria.selectedDate;
    this.travelClass = criteria.travelClass || 'economy';
    this.passengerCount = this.stepService.passengerCount || 1;
    this.onClassChange();
  }

  onClassChange() {
    this.extraPrice = this.travelClass === 'business' ? 500 : 0;

    // Eğer arama sonuçları varsa sınıf değişiminde fiyatları güncelle
    if (this.searched && this.fromAirportId && this.toAirportId && this.selectedDate) {
      this.searchFlights();
    }
  }

  loadAirports() {
    this.airportService.getAirports().subscribe(data => {
      this.airports = data.sort((a, b) =>
        a.city.localeCompare(b.city, 'tr')
      );
    });
  }

  loadFlights() {
    this.flightService.getFlights().subscribe(data => {
      this.allFlights = data;

      if (this.stepService.searchCriteria) {
        this.searchFlights();
      }
    });
  }

  // -------------------------------------------------
  //           SEARCH FLIGHTS (UPDATED)
  // -------------------------------------------------
  searchFlights() {
    this.searched = true;
    this.showFillWarning = false;
    this.showNoFlightsWarning = false;

    // ❌ Alanlar boşsa uyarı ver
    if (!this.fromAirportId || !this.toAirportId || !this.selectedDate) {
      this.filteredFlights = [];
      this.showFillWarning = true;
      return;
    }

    const dateStr = this.selectedDate;
    const classAddon = this.travelClass === 'business' ? 500 : 0;

    this.stepService.searchCriteria = {
      fromAirportId: this.fromAirportId,
      toAirportId: this.toAirportId,
      selectedDate: this.selectedDate,
      travelClass: this.travelClass
    };

    this.filteredFlights = this.allFlights
      .filter(f =>
        f.fromAirportId == this.fromAirportId &&
        f.toAirportId == this.toAirportId &&
        f.departureTime.startsWith(dateStr)
      )
      .map(f => ({
        ...f,
        finalPrice: Number(f.price ?? 0) + classAddon
      }));

    // ❌ Hiç uçuş yok ise uyarı göster
    if (this.filteredFlights.length === 0) {
      this.showNoFlightsWarning = true;
    }

    // ✔ Arama sonuçlarına otomatik scroll
    setTimeout(() => {
      const el = document.getElementById('flightResults');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  }

  // -------------------------------------------------
  //               SELECT FLIGHT
  // -------------------------------------------------
  isFlightPast(f: any): boolean {
    const departure = new Date(f.departureTime);
    const now = new Date();
    return departure.getTime() < now.getTime();
  }

  selectFlight(f: any) {
    if (this.isFlightPast(f)) {
      return;
    }
    const passengerCountNum = Number(this.passengerCount) > 0 ? Number(this.passengerCount) : 1;
    const selected = {
      id: f.id,
      fromAirportCity: f.fromAirportCity,
      toAirportCity: f.toAirportCity,
      departureTime: f.departureTime,
      basePrice: f.finalPrice,   // Economy/Business fiyat dahil!
      travelClass: this.travelClass,
      passengerCount: passengerCountNum
    };

    // ⭐ UÇUŞ BİLGİSİNİ YENİ SİSTEME KAYDEDİYORUZ
    this.stepService.selectedFlight = selected;
    this.stepService.passengerCount = passengerCountNum;

    this.stepService.completeStep('seatAvailability');
    this.stepService.setActiveStep('passengerInfo');

    const route = this.stepService.getStepRoute('passengerInfo');
    this.router.navigate(['/customer', route]);
  }

  swapAirports() {
    const temp = this.fromAirportId;
    this.fromAirportId = this.toAirportId;
    this.toAirportId = temp;
  }
}
