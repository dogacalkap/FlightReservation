import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReservationStepsService } from '../../../services/reservation-steps.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  constructor(
    private http: HttpClient,
    public stepService: ReservationStepsService,
    private router: Router
  ) {}

  cardHolder = "";
  cardNumber = "";
  expiry = "";
  saveCard = false;

  finalPrice = 0;
  message = "";
  loading = false;

  ngOnInit() {
    // 🔥 tüm fiyatı ReservationStepsService hesaplar
    this.finalPrice = this.stepService.getTotalPrice();
  }

  // ---------------------------------------------
  // 🔥 ÖDEME GÖNDERİMİ
  // ---------------------------------------------
  pay() {

  const body = {
    userId: this.stepService.passengerInfo?.userId,
    flightId: this.stepService.selectedFlight?.id,
    seatNumber: this.stepService.seatSelection?.seatNumber,

    baggageCount: this.stepService.baggage?.weight ?? 0,

    extraReward: this.stepService.extras[0]?.code ?? "",

    cardNumber: this.cardNumber,
    nameOnCard: this.cardHolder,
    expiryMonth: this.expiry.split('/')[0],
    expiryYear: this.expiry.split('/')[1],

    saveCard: this.saveCard
  };

  this.loading = true;

  this.http.post("http://localhost:5096/api/PaymentApi/pay", body)
    .subscribe({
      next: (res: any) => {
        this.loading = false;

        Swal.fire({
          title: "Ödeme Başarılı!",
          text: "Biletiniz başarıyla oluşturuldu.",
          icon: "success",
          confirmButtonText: "Ana Sayfaya Dön"
        }).then(() => {
          this.stepService.resetAll();
          this.router.navigate(['/landing']);
        });
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          title: "Ödeme Başarısız",
          text: err.error ?? "Sunucu yanıt vermedi.",
          icon: "error"
        });
      }
    });
}
}