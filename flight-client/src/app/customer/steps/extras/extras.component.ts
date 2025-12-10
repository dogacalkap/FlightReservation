import { Component } from '@angular/core';
import { ReservationDataService } from '../../../services/reservation-data.service';
import { LottieComponent } from 'ngx-lottie';
import { CommonModule } from '@angular/common';
import { ReservationStepsService } from '../../../services/reservation-steps.service';

interface ExtraService {
  code: string;       
  name: string;
  price: number;
  isSelected: boolean; 
  description: string;
  icon: string;
}

@Component({
  selector: 'app-extras',
  templateUrl: './extras.component.html',
  styleUrls: ['./extras.component.css'],
  imports: [CommonModule, LottieComponent]
})
export class ExtrasComponent {

  showWheel = false;
  spinning = false;
  rotation: number = 0;
  result: string | null = null;

  // Lottie paths
  confettiLottie = 'assets/lottie/confetti.json';

  services: ExtraService[] = [
    {
      code: 'INSURANCE',
      name: 'Seyahat Sigortası',
      price: 99,
      isSelected: false,
      description: 'Uçuşunuzu beklenmedik aksiliklere karşı güvence altına alın.',
      icon: 'bi-shield-lock'
    },
    {
      code: 'MEAL',
      name: 'Özel İkram Seçeneği',
      price: 49,
      isSelected: false,
      description: 'Uçuşunuz için gurme veya diyet yemek siparişi verin.',
      icon: 'bi-egg-fried'
    },
    {
      code: 'FAST_TRACK',
      name: 'Hızlı Geçiş (Fast Track)',
      price: 129,
      isSelected: false,
      description: 'Güvenlik ve pasaport kontrolünden hızlıca geçin.',
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
  private dataService: ReservationDataService,
  public stepService: ReservationStepsService
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
  }

  // 💥 HİZMET EKLE/KALDIR METODU (Çark ödüllerini koruyan temiz yol)
  toggleService(service: ExtraService) {
    service.isSelected = !service.isSelected;

    if (service.isSelected) {
      // Eklenecekse, servise ekle
      this.stepService.extras.push({
        name: service.name,
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
  this.showWheel = false;
}

} 


