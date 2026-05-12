import { Component } from '@angular/core';
import { LottieComponent } from 'ngx-lottie';
import { CommonModule } from '@angular/common';
import { ReservationStepsService } from '../../../services/reservation-steps.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/translate.pipe';
import { TranslationService } from '../../../services/translation.service';

interface ExtraService {
  code: string;
  nameKey: string;
  price: number;
  isSelected: boolean;
  descKey: string;
  icon: string;
}

@Component({
  selector: 'app-extras',
  templateUrl: './extras.component.html',
  styleUrls: ['./extras.component.css'],
  imports: [CommonModule, LottieComponent, TranslatePipe]
})
export class ExtrasComponent {

  showWheel = false;
  spinning = false;
  rotation: number = 0;
  result: string | null = null;
  get selectedCount(): number {
    return this.services.filter(s => s.isSelected).length;
  }

  // Lottie paths
  confettiLottie = 'assets/lottie/confetti.json';

  services: ExtraService[] = [
    {
      code: 'INSURANCE',
      nameKey: 'extras.insurance.name',
      price: 99,
      isSelected: false,
      descKey: 'extras.insurance.desc',
      icon: 'bi-shield-lock'
    },
    {
      code: 'MEAL',
      nameKey: 'extras.meal.name',
      price: 49,
      isSelected: false,
      descKey: 'extras.meal.desc',
      icon: 'bi-egg-fried'
    },
    {
      code: 'FAST_TRACK',
      nameKey: 'extras.fastTrack.name',
      price: 129,
      isSelected: false,
      descKey: 'extras.fastTrack.desc',
      icon: 'bi-lightning-charge'
    }
  ];
  prizes = [
  { code: "DISC10", label: "%10 İndirim" },
  { code: "DISC15", label: "%15 İndirim" },
  { code: "FREE_BAG", label: "Ücretsiz Kabin Bagajı" },
  { code: "BAG50", label: "Bagaj %50 İndirim" },
  { code: "FREE_TICKET", label: "Bir Sonraki Bilete Ücretsiz Hak" },
  { code: "NONE", label: "Ödül Yok" }
];

  hasSpun: boolean = false;   // kullanıcı çevirip çevirmedi
  // SES — Angular'da doğru yol
  clickSound = new Audio('assets/sounds/tick.mp3');

  constructor(
  public stepService: ReservationStepsService,
  private router: Router,
  private translationService: TranslationService
 ) {}

 ngOnInit(): void {
    // Serviste daha önce seçilmiş olan hizmetleri geri yükle
    this.services.forEach(service => {
      const selected = this.stepService.extras.find(e => e.code === service.code);
      if (selected) {
        service.isSelected = true;
      }
    });
    // Çark çevrildi mi kontrolü
    this.hasSpun = this.stepService.extras.some(e => e.code.includes('DISC') || e.code === 'FREE_BAG' || e.code === 'BAG50' || e.code === 'FREE_TICKET');
    this.result = this.stepService.wheelResult;
  }

  // 💥 HİZMET EKLE/KALDIR METODU (Çark ödüllerini koruyan temiz yol)
  toggleService(service: ExtraService) {
    service.isSelected = !service.isSelected;

    if (service.isSelected) {
      // Eklenecekse, servise ekle
      this.stepService.extras.push({
        name: this.translationService.translate(service.nameKey),
        price: service.price,
        code: service.code
      });
    } else {
      // Kaldırılacaksa, servisteki listeden çıkar (sadece hizmet kodlarını çıkar)
      const index = this.stepService.extras.findIndex(e => e.code === service.code);
      if (index !== -1) {
        this.stepService.extras.splice(index, 1);
      }
    }
  }

  // ===============================
  // MODAL AÇ / KAPAT
  // ===============================
  openWheel() {
    this.showWheel = true;
    this.result = null;
  }

  closeWheel() {
    if (this.spinning) return; // Dönerken kapatma
    this.showWheel = false;
  }

  // ===============================
  // TICK SESİ
  // ===============================
  playTickSound() {
    this.clickSound.currentTime = 0;
    this.clickSound.play().catch(() => {});
  }

  // ===============================
  // ÇARK ÇEVİRME
  // ===============================
  spinWheel() {
  if (this.spinning || this.hasSpun) return;

  this.spinning = true;
  this.result = null;

  const randomIndex = Math.floor(Math.random() * this.prizes.length);
  const prize = this.prizes[randomIndex];

  const slice = 360 / this.prizes.length;
  const fullRotations = 360 * 6;
  const finalRotation = fullRotations + (slice * randomIndex) + slice / 2;

  let tickInterval = setInterval(() => this.playTickSound(), 120);

  this.rotation = finalRotation;

  setTimeout(() => {
    clearInterval(tickInterval);

    this.result = prize.label;
    this.stepService.wheelResult = prize.label;
    this.spinning = false;
    this.hasSpun = true;

    // ================================
    // ⭐ ÖDÜLÜ DOĞRU SERVİSE YAZIYORUZ
    // ================================
    switch (prize.code) {

      case "DISC10":
        this.stepService.extras.push({
          name: "%10 İndirim",
          price: - (this.stepService.getTotalPrice() * 0.10),
          code: "DISC10"
        });
        break;

      case "DISC15":
        this.stepService.extras.push({
          name: "%15 İndirim",
          price: - (this.stepService.getTotalPrice() * 0.15),
          code: "DISC15"
        });
        break;

      case "FREE_BAG":
        this.stepService.extras.push({
          name: "Ücretsiz Kabin Bagajı",
          price: -299,
          code: "FREE_BAG"
        });
        break;

      case "BAG50":
        this.stepService.extras.push({
          name: "Bagaj %50 İndirim",
          price: - (this.stepService.baggage?.price || 0) * 0.5,
          code: "BAG50"
        });
        break;

      case "FREE_TICKET":
        this.stepService.extras.push({
          name: "Bir Sonraki Bilet Ücretsiz",
          price: 0,
          code: "FREE_TICKET"
        });
        break;

      case "NONE":
        this.stepService.extras.push({
          name: "Herhangi bir ödül yok",
          price: 0,
          code: "NONE"
        });
        break;
    }

  }, 4500);
}
continue() {
  if (this.spinning) return;

  this.stepService.completeStep('extras');
  this.stepService.setActiveStep('payment');
  const route = this.stepService.getStepRoute('payment');
  this.router.navigate(['/customer', route]);
  this.showWheel = false;
}

} 
