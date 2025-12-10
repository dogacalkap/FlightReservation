import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationStepsService } from '../../../services/reservation-steps.service';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.css']
})
export class SeatSelectionComponent implements OnInit {

  rows = 30;  
  seatsPerRow = ['A', 'B', 'C', 'D', 'E', 'F'];

  takenSeats: string[] = [];
  selectedSeat: string | null = null;

  seatMap: string[][] = [];

  constructor(private stepService: ReservationStepsService) {}

  ngOnInit(): void {
    this.buildSeatMap();
    this.takenSeats = []; // Backend dolduracak
  }

  buildSeatMap() {
    for (let row = 1; row <= this.rows; row++) {
      let rowSeats = this.seatsPerRow.map(letter => `${row}${letter}`);
      this.seatMap.push(rowSeats);
    }
  }


  // Basit fiyatlandırma örneği:  
  // 1–5 sıra: +200 TL  
  // 6–15 sıra: +100 TL  
  // 16–30 sıra: +0 TL
  getSeatPrice(seat: string): number {
    const row = parseInt(seat);

    if (row <= 5) return 200;
    if (row <= 15) return 100;
    return 0;
  }

  getRowType(seat: string): string {
    const price = this.getSeatPrice(seat); // Mevcut kuralı kullan
    
    if (price === 200) {
      // 1-5. sıralar (Premium/Yüksek Fiyatlı)
      return 'row-yellow';
    }
    if (price === 100) {
      // 6-15. sıralar (Ekstra Diz Mesafesi/Orta Fiyatlı)
      return 'row-purple';
    }
    // 16-30. sıralar (Standart)
    return 'row-standard';
  }

  selectSeat(seat: string) {
    if (this.takenSeats.includes(seat)) return;
    this.selectedSeat = seat;
  }

  

  continue() {
    if (!this.selectedSeat) return;

    const price = this.getSeatPrice(this.selectedSeat);

    // ⭐ SERVİSE DOĞRU FORMATTA KAYDEDİYORUZ
    this.stepService.seatSelection = {
      seatNumber: this.selectedSeat,
      price: price
    };

    // Step tamamlandı
    this.stepService.completeStep('seatSelection');

    // Sonraki step
    this.stepService.setActiveStep('baggage');
  }
}
