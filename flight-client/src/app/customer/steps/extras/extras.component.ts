import { Component } from '@angular/core';
import { ReservationDataService } from '../../../services/reservation-data.service';
import { LottieComponent } from 'ngx-lottie';
import { CommonModule } from '@angular/common';
import { ReservationStepsService } from '../../../services/reservation-steps.service';

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
  shineLottie = 'assets/lottie/shine.json';
  confettiLottie = 'assets/lottie/confetti.json';

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


