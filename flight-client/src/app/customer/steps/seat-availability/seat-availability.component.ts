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

@Component({
  selector: 'app-seat-availability',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
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

  constructor(
    private airportService: AirportService,
    private flightService: CustomerFlightService,
    private router: Router,
    public stepService: ReservationStepsService,
    private dataService: ReservationDataService
  ) {}
  
  ngOnInit(): void {
    this.loadAirports();
    this.loadFlights();
  }

  onClassChange() {
    this.extraPrice = this.travelClass === 'business' ? 300 : 0;
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

    this.filteredFlights = this.allFlights
      .filter(f =>
        f.fromAirportId == this.fromAirportId &&
        f.toAirportId == this.toAirportId &&
        f.departureTime.startsWith(dateStr)
      )
      .map(f => ({
        ...f,
        finalPrice: f.price + this.extraPrice
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
  selectFlight(f: any) {
  const selected = {
    id: f.id,
    fromAirportCity: f.fromAirportCity,
    toAirportCity: f.toAirportCity,
    departureTime: f.departureTime,
    basePrice: f.finalPrice,   // Economy/Business fiyat dahil!
    travelClass: this.travelClass
  };

  // ⭐ UÇUŞ BİLGİSİNİ YENİ SİSTEME KAYDEDİYORUZ
  this.stepService.selectedFlight = selected;

  // Eski servis artık kullanılmıyor → silebilirsin
  // this.dataService.setFlight(selected);

  this.stepService.completeStep('seatAvailability');
  this.stepService.setActiveStep('passengerInfo');

  if (this.redirectToCustomer) {
    // Landing'den geldiğinde müşteri akışına yönlendir
    this.router.navigate(['/customer']);
  }
}

  swapAirports() {
    const temp = this.fromAirportId;
    this.fromAirportId = this.toAirportId;
    this.toAirportId = temp;
  }
}
