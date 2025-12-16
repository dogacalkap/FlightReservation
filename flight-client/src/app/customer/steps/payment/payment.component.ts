import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReservationStepsService } from '../../../services/reservation-steps.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '../../../shared/translate.pipe';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, TranslatePipe],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  private API_URL = "http://localhost:5096/api/PaymentApi/pay"; 

  // KART BİLGİLERİ VE DURUM DEĞİŞKENLERİ
  cardHolder = "";
  cardNumber = "";
  expiry = ""; // MM/YY
  cvv = "";    
  saveCard = false;

  finalPrice = 0;
  loading = false;
  
  paymentError: string | null = null; 
  paymentSuccess: string | null = null; 

  constructor(
    private http: HttpClient,
    public stepService: ReservationStepsService,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private i18n: TranslationService
  ) {}

  ngOnInit() {
    this.finalPrice = this.stepService.getTotalPrice();
    if (!this.auth.getCurrentUser() || !this.stepService.selectedFlight) {
        Swal.fire(
          this.i18n.translate('payment.error.title'),
          this.i18n.translate('payment.error.sessionMissing'),
          'error'
        );
        this.router.navigate(['/landing']);
    }
  }

  // ---------------------------------------------
  // VALIDASYON METODU
  // ---------------------------------------------
  validateCardDetails(): boolean {
    this.paymentError = null;

    if (!this.cardHolder || !this.cardNumber || !this.expiry || !this.cvv) {
        this.paymentError = this.i18n.translate('payment.error.fillAll');
        Swal.fire(this.i18n.translate('payment.error.title'), this.paymentError, 'warning');
        return false;
    }

    const cleanNumber = this.cardNumber.replace(/\s/g, '');
    if (cleanNumber.length !== 16 || !/^\d+$/.test(cleanNumber)) {
        this.paymentError = this.i18n.translate('payment.error.cardLength');
        Swal.fire(this.i18n.translate('payment.error.title'), this.paymentError, 'warning');
        return false;
    }

    if (this.cvv.length !== 3 || !/^\d+$/.test(this.cvv)) {
        this.paymentError = this.i18n.translate('payment.error.cvvLength');
        Swal.fire(this.i18n.translate('payment.error.title'), this.paymentError, 'warning');
        return false;
    }

    // Tarih Validasyonu
    const expiryRegex = /^(\d{2})\/(\d{2})$/;
    if (!expiryRegex.test(this.expiry)) {
        this.paymentError = this.i18n.translate('payment.error.expiryFormat');
        Swal.fire(this.i18n.translate('payment.error.title'), this.paymentError, 'warning');
        return false;
    }
    const [, monthStr, yearStr] = this.expiry.match(expiryRegex)!;
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    if (month < 1 || month > 12) {
        this.paymentError = this.i18n.translate('payment.error.monthRange');
        Swal.fire(this.i18n.translate('payment.error.title'), this.paymentError, 'warning');
        return false;
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        this.paymentError = this.i18n.translate('payment.error.cardExpired');
        Swal.fire(this.i18n.translate('payment.error.title'), this.paymentError, 'error');
        return false;
    }
    return true;
  }

  // ---------------------------------------------
  // ÖDEME VE DB KAYDI
  // ---------------------------------------------
  pay() {
    if (!this.validateCardDetails()) {
        return;
    }

    const currentUser = this.auth.getCurrentUser();

    if (!currentUser || !this.stepService.selectedFlight) {
        Swal.fire(
          this.i18n.translate('payment.error.title'),
          this.i18n.translate('payment.error.dataInvalid'),
          'error'
        );
        this.router.navigate(['/landing']);
        return;
    }

    // 💥 API'ye GÖNDERİLECEK VERİ (C# DTO'ya uyumlu CamelCase)
    const body = {
        UserId: currentUser.userId,
        FlightId: this.stepService.selectedFlight.id, 
        
        // 🚨 KRİTİK DÜZELTME: C# API'sinin hesaplamayı doğru yapması için fiyatları DECIMAL olarak gönderiyoruz.
        SeatNumber: this.stepService.seatSelection?.seatNumber ?? '',
        SeatPrice: this.stepService.seatSelection?.price ?? 0, // C# tarafında decimal olmalı
        BaggageCount: this.stepService.baggage?.weight ?? 0,
        BaggagePrice: this.stepService.baggage?.price ?? 0, // C# tarafında decimal olmalı
        
        // Ekstralar listesi
        Extras: this.stepService.extras.map(e => ({
            ExtraCode: e.code,
            ExtraName: e.name,
            ExtraPrice: e.price // C# tarafında decimal olmalı
        })),

        // C# API'niz tek bir string beklediği için en kritik ödülü gönderiyoruz.
        ExtraReward: this.stepService.extras.find(e => e.price < 0)?.name ?? '',
        
        CardNumber: this.cardNumber.replace(/\s/g, ''),
        NameOnCard: this.cardHolder,
        ExpiryMonth: this.expiry.split('/')[0],
        ExpiryYear: this.expiry.split('/')[1],
        Cvv: this.cvv, 
        SaveCard: this.saveCard
    };

    console.log("API'ye Gönderilen BODY (JSON):", body);
    this.loading = true;
    this.cdr.detectChanges(); 

    this.http.post(this.API_URL, body)
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          // API'den dönen nihai fiyatı (res.finalPrice) kullanarak mesajı gösteriyoruz.
          const finalPriceFromAPI = res.finalPrice || this.finalPrice;

          Swal.fire({
            title: this.i18n.translate('payment.success.title'),
            text: `${this.i18n.translate('payment.success.message')} ${finalPriceFromAPI.toFixed(2)} ₺`,
            icon: "success",
            confirmButtonText: this.i18n.translate('payment.success.returnHome')
          }).then(() => {
            this.stepService.resetAll();
            this.router.navigate(['/landing']);
          });
        },
        error: (err) => {
          this.loading = false;
          this.cdr.detectChanges();

          const errorMessage = err.error?.message || err.error || this.i18n.translate('payment.error.unknown');

          Swal.fire({
            title: this.i18n.translate('payment.error.title'),
            text: errorMessage,
            icon: "error"
          });
        }
      });
}
}