import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SeatAvailabilityComponent } from '../steps/seat-availability/seat-availability.component';
import { PassengerInfoComponent } from '../steps/passenger-info/passenger-info.component';
import { SeatSelectionComponent } from '../steps/seat-selection/seat-selection.component';
import { BaggageComponent } from '../steps/baggage/baggage.component';
import { ExtrasComponent } from '../steps/extras/extras.component';
import { PaymentComponent } from '../steps/payment/payment.component';

import { ReservationStepsService } from '../../services/reservation-steps.service';
import { StepKey } from '../../types/step-key';
import { Router, NavigationEnd } from '@angular/router';

import { ChangeDetectorRef } from '@angular/core'; 
@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SeatAvailabilityComponent,
    PassengerInfoComponent,
    SeatSelectionComponent,
    BaggageComponent,
    ExtrasComponent,
    PaymentComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class CustomerHomeComponent implements OnInit {

  backgroundImage: string = '';
  showSteps: boolean = true;

  // Karşılama + geçiş ekranları
  showWelcomeScreen: boolean = true;
  showTransition: boolean = false;

  constructor(
    public stepService: ReservationStepsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setBackgroundBasedOnTime();

    // Sayfa her açıldığında karşılama ekranı görünsün
    this.showWelcomeScreen = true;
    this.showTransition = false;

    // Eğer landing'de arama yapılıp uçuş seçilmişse karşılama ekranını atla
    if (this.stepService.steps.seatAvailability || this.stepService.selectedFlight) {
      this.showWelcomeScreen = false;
      this.showTransition = false;

      // İlk adım zaten tamamlandı, bir sonraki adıma geç
      if (this.stepService.activeStep === 'seatAvailability') {
        this.stepService.setActiveStep('passengerInfo');
      }

      // Anında UI'yı güncelle
      this.cdr.detectChanges();
    }

    // Customer route içindeyken steps görünsün
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showSteps = event.urlAfterRedirects.startsWith('/customer');
      }
    });
  }

  setBackgroundBasedOnTime(): void {
    // İstersen burada ileride gündüz/gece arka planı seçebilirsin.
  }

  /**
   * Service'teki StepKey'i (seatAvailability, passengerInfo, ...)
   * UI'da kullandığımız key'e (seat-status, passenger-info, ...) çeviriyoruz.
   */
  get activeStepKey(): string {
    const found = this.steps.find(s => s.serviceKey === this.stepService.activeStep);
    return found ? found.key : this.steps[0].key; // fallback: ilk adım
  }

  /**
   * Karşılama ekranından süreci başlatır.
   * Kısa bir geçiş animasyonu gösterip ilk adımı aktif eder.
   */
  startProcess() {
    // 1. Karşılama ekranını gizle
    this.showWelcomeScreen = false;
    
    // 2. Geçiş görselini tetikle
    this.showTransition = true;

    // 3. 1.2 saniye sonra geçiş görselini gizle ve asıl adımı aktif et.
    setTimeout(() => {
      this.showTransition = false;
      
      // İlk adımı (seatAvailability) aktif et
      this.stepService.setActiveStep('seatAvailability');
      
      // 💥 KRİTİK ADIM: Angular'ı hemen güncellemeye zorla
      this.cdr.detectChanges(); 
      
      console.log('Bilet alma akışı başlatıldı: Seat Availability.');
      
    }, 1200); 
  }

  /**
   * 🚨 GÜNCELLENDİ: Kullanıcı step bar'dan adım seçtiğinde çalışır.
   * Atlanan veya geri dönülen adımlarda sıfırlama kuralını uygular.
   */
  tryGoToStep(step: any) {
    const order = this.steps.map(s => s.key); // ['seat-status', 'passenger-info', ...]

    const targetIndex = order.indexOf(step.key);
    const activeIndex = order.indexOf(this.activeStepKey);
    
    // Geçiş yapılacak adım zaten aktif adım ise hiçbir şey yapma.
    if (step.key === this.activeStepKey) {
        return;
    }

    // ----------------------------------------------------
    // KONTROL 1: GERİYE DÖNÜŞ VE SIFIRLAMA KONTROLÜ
    // ----------------------------------------------------
    // Geriye dönülmeye çalışılıyorsa
    if (targetIndex < activeIndex) {
        
        const confirmReset = confirm('Geri dönme işlemi tüm rezervasyonu sıfırlayacaktır. Emin misiniz?');
        
        if (confirmReset) {
            // Rezervasyonu sıfırla (tüm veriler silinir)
            this.stepService.resetAll(); 
            // İlk adıma dön (UI key: 'seat-status', Service key: 'seatAvailability')
            this.stepService.setActiveStep(this.steps[0].serviceKey); 
            this.cdr.detectChanges();
            return;
        } else {
            return; // Vazgeçerse olduğu adımda kal
        }
    }


    // ----------------------------------------------------
    // KONTROL 2: İLERİYE ATLAMA KONTROLÜ (Tamamlanma Zorunluluğu)
    // ----------------------------------------------------
    
    // Sadece bir sonraki adıma (targetIndex === activeIndex + 1) geçişe izin verilir.
    // Daha ileriye atlanıyorsa (targetIndex > activeIndex + 1), sırayı kontrol et.

    const prevKey = order[activeIndex]; // Şu an bulunduğumuz adımın UI key'i
    const currentStepService = this.steps.find(s => s.key === prevKey)!;

    // Aktif adımdan daha ileri bir adıma (bir sonraki adım değil) atlanmaya çalışılıyorsa:
    if (targetIndex > activeIndex + 1) {
        alert('Lütfen adımları sırayla tamamlayınız. İleriye atlama yapılamaz!');
        return;
    }

    // Eğer bir sonraki adıma (normal akış) geçiliyorsa, mevcut adımın tamamlandığını kontrol et
    // Not: Bu kontrol, step içeriğindeki 'continue' butonu ile completion bayrağı tetiklenmediyse önemlidir.
    if (targetIndex === activeIndex + 1) {
        if (!this.stepService.steps[currentStepService.serviceKey]) {
            alert('Lütfen önce mevcut adımı tamamlayınız.');
            return;
        }
    }


    // ----------------------------------------------------
    // KONTROL 3: NORMAL GEÇİŞ VE ANİMASYON
    // ----------------------------------------------------
    
    // Geçiş animasyonunu başlat
    this.showTransition = true;
    
    // UI key'i service key'e çevir
    const targetServiceKey = step.serviceKey; 

    setTimeout(() => {
        this.showTransition = false;
        
        // Yeni adımı service key ile aktif et
        this.stepService.setActiveStep(targetServiceKey);
        
        this.cdr.detectChanges(); 
        
        console.log(`Geçiş tamamlandı: ${this.activeStepKey} -> ${step.key}`);
    }, 1200);
  }

  // UI'da kullanılan step listesi (Aynen Kalacak)
  steps = [
    { key: 'seat-status',     serviceKey: 'seatAvailability' as StepKey, label: 'Koltuk Durumu',   icon: 'bi bi-check-circle' },
    { key: 'passenger-info',  serviceKey: 'passengerInfo'   as StepKey, label: 'Yolcu Bilgisi',   icon: 'bi bi-person-vcard' },
    { key: 'seat-selection',  serviceKey: 'seatSelection'   as StepKey, label: 'Koltuk Seçimi',   icon: 'bi bi-grid-3x3-gap' },
    { key: 'baggage',         serviceKey: 'baggage'         as StepKey, label: 'Bagaj',           icon: 'bi bi-bag' },
    { key: 'extras',          serviceKey: 'extras'          as StepKey, label: 'Ek Hizmetler',    icon: 'bi bi-plus-circle' },
    { key: 'payment',         serviceKey: 'payment'         as StepKey, label: 'Ödeme',           icon: 'bi bi-credit-card' }
  ];

  // Her UI key için hangi component yüklenecek (Aynen Kalacak)
  stepComponents: Record<string, any> = {
    'seat-status':    SeatAvailabilityComponent,
    'passenger-info': PassengerInfoComponent,
    'seat-selection': SeatSelectionComponent,
    'baggage':        BaggageComponent,
    'extras':         ExtrasComponent,
    'payment':        PaymentComponent
  };

  // Her step için info panel verisi (Aynen Kalacak)
  stepInfo: Record<string, { title: string; description: string; icon: string; image?: string }> = {
    'seat-status': {
      title: 'Koltuk Durumu',
      description: 'Bu adımda uçuşun doluluk oranını ve boş koltukları görüntülersiniz.',
      icon: 'bi bi-check2-circle',
      image: 'assets/info/seat.png'
    },
    'passenger-info': {
      title: 'Yolcu Bilgisi',
      description: 'Kimlik ve iletişim bilgilerinizi girerek rezervasyonu kişiselleştirin.',
      icon: 'bi bi-person-badge',
      image: 'assets/info/passenger.png'
    },
    'seat-selection': {
      title: 'Koltuk Seçimi',
      description: 'Uçakta oturmak istediğiniz koltuğu seçebilirsiniz.',
      icon: 'bi bi-grid-3x3-gap',
      image: 'assets/info/seat-select.png'
    },
    'baggage': {
      title: 'Bagaj',
      description: 'Ek bagaj hakkı satın alabilir veya mevcut limitinizi düzenleyebilirsiniz.',
      icon: 'bi bi-bag',
      image: 'assets/info/baggage.png'
    },
    'extras': {
      title: 'Ek Hizmetler',
      description: 'Yemek, sigorta, hızlı geçiş gibi ek hizmetleri bu adımda ekleyebilirsiniz.',
      icon: 'bi bi-plus-circle',
      image: 'assets/info/extras.png'
    },
    'payment': {
      title: 'Ödeme',
      description: 'Rezervasyonunuzu tamamlamak için ödeme bilgilerinizi girin.',
      icon: 'bi bi-credit-card',
      image: 'assets/info/payment.png'
    }
  };

}
