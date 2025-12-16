import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationStepsService } from '../../../services/reservation-steps.service';
import { LottieComponent } from 'ngx-lottie';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/translate.pipe';

@Component({
  selector: 'app-baggage',
  standalone: true,
  imports: [CommonModule, LottieComponent, TranslatePipe],
  templateUrl: './baggage.component.html',
  styleUrls: ['./baggage.component.css']
})
export class BaggageComponent {

  constructor(
    private stepService: ReservationStepsService,
    private router: Router
  ) {}

  bagUnderSeat = 'assets/lottie/bag-underseat.json';
  cabinBag = 'assets/lottie/cabin-bag.json';
  largeBag = 'assets/lottie/large-bag.json';

  baggageCount = 0;
  baggagePrice = 299;  // her bagaj için fiyat

  increase() {
    this.baggageCount++;
  }

  decrease() {
    if (this.baggageCount > 0) {
      this.baggageCount--;
    }
  }

  continue() {
    const totalPrice = this.baggageCount * this.baggagePrice;

    // ⭐ DOĞRU SEVICE ALANINA YAZIYORUZ
    this.stepService.baggage = {
      weight: this.baggageCount,
      price: totalPrice
    };

    this.stepService.completeStep('baggage');
    this.stepService.setActiveStep('extras');
    const route = this.stepService.getStepRoute('extras');
    this.router.navigate(['/customer', route]);
  }

}
