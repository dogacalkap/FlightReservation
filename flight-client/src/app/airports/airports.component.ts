import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirportService } from '../services/airport.service';
import { Airport } from '../models/airport';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { TranslatePipe } from '../shared/translate.pipe';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-airports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './airports.component.html',
  styleUrls: ['./airports.component.css']
})
export class AirportsComponent implements OnInit {

  airports: Airport[] = [];
  form!: FormGroup;
  error: string | null = null;
  loading = true;
  editId: number | null = null;   // null → create, id → update

  constructor(
    private airportService: AirportService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private i18n: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadAirports();

    // ⭐ REACTIVE FORM SETUP
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required]
    });
  }

  // ---------------------------
  // Listeyi backend'den çek
  // ---------------------------
  loadAirports(): void {
    this.loading = true;
    this.airportService.getAirports().subscribe({
      next: (data) => {
        this.airports = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = this.i18n.translate('adminAirports.error.load');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ---------------------------
  // Formu temizle → CREATE moduna geç
  // ---------------------------
  clearForm(): void {
    this.editId = null;
    this.form.reset();
    this.error = null;
  }

  // ---------------------------
  // EDIT butonu → Güncelleme moduna geç
  // ---------------------------
  editAirport(a: Airport): void {
    this.editId = a.id;

    this.form.patchValue({
      code: a.code,
      name: a.name,
      city: a.city,
      country: a.country
    });
  }

  // ---------------------------
  // CREATE + UPDATE
  // ---------------------------
  saveAirport(): void {
    if (!this.form.valid) {
      this.error = this.i18n.translate('adminAirports.error.required');
      return;
    }

    const airportData: Airport = {
      id: this.editId ?? 0,
      ...this.form.value
    };

    if (this.editId === null) {
      // ⭐ CREATE
      this.airportService.createAirport(airportData).subscribe({
        next: (created) => {
          this.airports.push(created);
          this.clearForm();
        },
        error: () => this.error = this.i18n.translate('adminAirports.error.create')
      });

    } else {
      // ⭐ UPDATE
      this.airportService.updateAirport(airportData).subscribe({
        next: () => {
          const index = this.airports.findIndex(a => a.id === this.editId);
          if (index >= 0) this.airports[index] = airportData;

          this.clearForm();
        },
        error: () => this.error = this.i18n.translate('adminAirports.error.update')
      });
    }
  }

  // ---------------------------
  // DELETE → DOM attribute üzerinden güvenli ID
  // ---------------------------
  onDeleteClick(id: number): void {
  if (!confirm(this.i18n.translate('adminAirports.confirm.delete'))) return;

  this.airportService.deleteAirport(id).subscribe({
    next: () => this.loadAirports(),
    error: () => this.error = this.i18n.translate('adminAirports.error.delete')
  });
}



}
