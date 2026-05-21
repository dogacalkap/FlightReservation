import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationStepsService } from '../../../services/reservation-steps.service';
import { LottieComponent } from 'ngx-lottie';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/translate.pipe';
import { BaggageService } from '../../../services/baggage.service';
import { AuthService } from '../../../services/auth.service';
import { TranslationService } from '../../../services/translation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-baggage',
  standalone: true,
  imports: [CommonModule, LottieComponent, TranslatePipe],
  templateUrl: './baggage.component.html',
  styleUrls: ['./baggage.component.css']
})
export class BaggageComponent implements OnInit {

  saving = false;
  loadingSavedSelection = false;

  constructor(
    private stepService: ReservationStepsService,
    private router: Router,
    private baggageService: BaggageService,
    private auth: AuthService,
    private i18n: TranslationService
  ) {}

  bagUnderSeat = 'assets/lottie/bag-underseat.json';
  cabinBag = 'assets/lottie/cabin-bag.json';
  largeBag = 'assets/lottie/large-bag.json';

  baggageCount = 0;
  baggagePrice = 299;  // her bagaj için fiyat

  ngOnInit(): void {
    this.baggageCount = this.stepService.baggage?.weight ?? 0;

    const flightId = Number(this.stepService.selectedFlight?.id);
    if (!this.auth.isAuthenticated() || Number.isNaN(flightId)) {
      return;
    }

    this.loadingSavedSelection = true;
    this.baggageService.getMySelectionForFlight(flightId).subscribe({
      next: (selection) => {
        this.loadingSavedSelection = false;

        if (!selection) {
          return;
        }

        this.baggageCount = selection.baggageCount;
        this.stepService.baggage = {
          weight: selection.baggageCount,
          price: Number(selection.price)
        };
      },
      error: () => {
        this.loadingSavedSelection = false;
      }
    });
  }

  increase() {
    this.baggageCount++;
  }

  decrease() {
    if (this.baggageCount > 0) {
      this.baggageCount--;
    }
  }

  continue() {
    if (!this.auth.isAuthenticated()) {
      Swal.fire(
        this.i18n.translate('baggage.error.title'),
        this.i18n.translate('baggage.error.loginRequired'),
        'warning'
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.stepService.selectedFlight?.id) {
      Swal.fire(
        this.i18n.translate('baggage.error.title'),
        this.i18n.translate('baggage.error.flightMissing'),
        'error'
      );
      this.router.navigate(['/landing']);
      return;
    }

    const totalPrice = this.baggageCount * this.baggagePrice;

    this.stepService.baggage = {
      weight: this.baggageCount,
      price: totalPrice
    };

    this.saving = true;
    this.baggageService.saveSelection({
      flightId: Number(this.stepService.selectedFlight.id),
      baggageCount: this.baggageCount,
      price: totalPrice
    }).subscribe({
      next: () => {
        this.saving = false;
        this.stepService.completeStep('baggage');
        this.stepService.setActiveStep('extras');
        const route = this.stepService.getStepRoute('extras');
        this.router.navigate(['/customer', route]);
      },
      error: (err) => {
        this.saving = false;
        Swal.fire(
          this.i18n.translate('baggage.error.title'),
          err.error?.message || this.i18n.translate('baggage.error.saveFailed'),
          'error'
        );
      }
    });
  }

}
