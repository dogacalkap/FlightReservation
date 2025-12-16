import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FlightService } from '../services/flight.service';
import { AirportService } from '../services/airport.service';
import { Airport } from '../models/airport';
import { FlightCreateDto } from '../models/flight-create-dto';
import { Flight } from '../models/flight';
import { ChangeDetectorRef } from '@angular/core';
import { TranslatePipe } from '../shared/translate.pipe';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './flights.component.html',
  styleUrl: './flights.component.css'
})
export class FlightsComponent implements OnInit {

  flights: Flight[] = [];     // Backend’ten gelen geniş model
  airports: Airport[] = [];

  form!: FormGroup;
  editId: number | null = null;
  error: string | null = null;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private flightService: FlightService,
    private airportService: AirportService,
    private cdr: ChangeDetectorRef,
    private i18n: TranslationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      flightNumber: ['', Validators.required],
      fromAirportId: [null, Validators.required],
      toAirportId: [null, Validators.required],
      departureTime: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]]
    });

    this.loadAirports();
    this.loadFlights();
  }

  loadAirports(): void {
    this.airportService.getAirports().subscribe({
      next: (data) => {
        this.airports = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = this.i18n.translate('adminFlights.error.loadAirports');
        this.cdr.detectChanges();
      }
    });
  }

  loadFlights(): void {
    this.loading = true;
    this.error = null;

    this.flightService.getFlights().subscribe({
      next: (data) => {
        this.flights = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = this.i18n.translate('adminFlights.error.load');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearForm(): void {
    this.editId = null;
    this.form.reset();
    this.error = null;
  }

  editFlight(f: Flight): void {
    this.editId = f.id;

    this.form.patchValue({
      flightNumber: f.flightNumber,
      fromAirportId: f.fromAirportId,
      toAirportId: f.toAirportId,
      departureTime: f.departureTime.substring(0, 16),
      arrivalTime: f.arrivalTime.substring(0, 16),
      price: f.price
    });
  }

  saveFlight(): void {
    if (!this.form.valid) {
      this.error = this.i18n.translate('adminFlights.error.required');
      return;
    }

    const values = this.form.value;

    // 🔥 ARTIK DTO KULLANIYORUZ → Flight model hatası ÇÖZÜLDÜ
    const flightData: FlightCreateDto = {
      id: this.editId ?? 0,
      flightNumber: values.flightNumber,
      fromAirportId: Number(values.fromAirportId),
      toAirportId: Number(values.toAirportId),
      departureTime: values.departureTime,
      arrivalTime: values.arrivalTime,
      price: Number(values.price)
    };

    if (this.editId === null) {
      // CREATE
      this.flightService.createFlight(flightData).subscribe({
        next: () => {
          this.loadFlights();
          this.clearForm();
        },
        error: () => this.error = this.i18n.translate('adminFlights.error.create')
      });

    } else {
      // UPDATE
      this.flightService.updateFlight(flightData).subscribe({
        next: () => {
          this.loadFlights();
          this.clearForm();
        },
        error: () => this.error = this.i18n.translate('adminFlights.error.update')
      });
    }
  }

  onDeleteClick(event: Event): void {
    const id = Number((event.target as HTMLElement).getAttribute('data-id'));
    if (!id) return;

    if (!confirm(this.i18n.translate('adminFlights.confirm.delete'))) return;

    this.flightService.deleteFlight(id).subscribe({
      next: () => this.loadFlights(),
      error: () => this.error = this.i18n.translate('adminFlights.error.delete')
    });
  }
}
