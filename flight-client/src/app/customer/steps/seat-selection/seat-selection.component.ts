import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReservationStepsService } from '../../../services/reservation-steps.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/translate.pipe';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.css']
})
export class SeatSelectionComponent implements OnInit {

  rows = 30;
  seatsPerRow = ['A', 'B', 'C', 'D', 'E', 'F'];

  seatMap: string[][] = [];

  takenSeats: string[] = [];
  selectedSeat: string | null = null;

  apiUrl = 'http://localhost:5096/api/SeatOccupation';

  constructor(
    private stepService: ReservationStepsService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildSeatMap();

    // ❌ Flight seçilmeden buraya gelinmişse DUR
    if (!this.stepService.selectedFlight?.id) {
      console.error('Flight seçilmeden seat selectiona gelindi');
      return;
    }

    const flightIdRaw = this.stepService.selectedFlight.id;
    const flightId = Number(flightIdRaw);

    if (Number.isNaN(flightId)) {
      console.error('Geçersiz flightId değeri:', flightIdRaw);
      return;
    }

    // ✅ Backend'den dolu koltukları çek
    this.loadOccupiedSeats(flightId);
  }

  // -----------------------------
  // KOLTUK HARİTASI
  // -----------------------------
  buildSeatMap() {
    this.seatMap = [];

    for (let row = 1; row <= this.rows; row++) {
      const rowSeats = this.seatsPerRow.map(letter => `${row}${letter}`);
      this.seatMap.push(rowSeats);
    }
  }

  // -----------------------------
  // BACKEND → DOLU KOLTUKLAR
  // -----------------------------
  loadOccupiedSeats(flightId: number) {
    const url = `${this.apiUrl}/${flightId}`;
    console.log('Dolu koltuk GET URL:', url);

    this.http.get<string[]>(url).subscribe({
      next: (seats) => {
        this.takenSeats = seats;
        console.log('Dolu koltuklar:', this.takenSeats);
      },
      error: (err) => {
        console.error('Dolu koltuklar alınamadı', err);
      }
    });
  }

  // -----------------------------
  // KOLTUK DURUMU
  // -----------------------------
  isSeatOccupied(seat: string): boolean {
    return this.takenSeats.includes(seat);
  }

  selectSeat(seat: string) {
    if (this.isSeatOccupied(seat)) return;
    this.selectedSeat = seat;
  }

  // -----------------------------
  // FİYATLANDIRMA
  // -----------------------------
  getSeatPrice(seat: string): number {
    const row = parseInt(seat, 10);

    if (row <= 5) return 200;
    if (row <= 15) return 100;
    return 0;
  }

  getRowType(seat: string): string {
    const price = this.getSeatPrice(seat);

    if (price === 200) return 'row-yellow';
    if (price === 100) return 'row-purple';
    return 'row-standard';
  }

  // -----------------------------
  // DEVAM
  // -----------------------------
  continue() {
    if (!this.selectedSeat) return;

    const price = this.getSeatPrice(this.selectedSeat);

    this.stepService.seatSelection = {
      seatNumber: this.selectedSeat,
      price: price
    };

    this.stepService.completeStep('seatSelection');
    this.stepService.setActiveStep('baggage');
    const route = this.stepService.getStepRoute('baggage');
    this.router.navigate(['/customer', route]);
  }
}
