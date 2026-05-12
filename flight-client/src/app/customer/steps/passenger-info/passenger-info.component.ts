import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';
import { ReservationStepsService } from '../../../services/reservation-steps.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/translate.pipe';

@Component({
  selector: 'app-passenger-info',
  standalone: true,
  imports: [CommonModule, AuthModalComponent, TranslatePipe],
  templateUrl: './passenger-info.component.html',
  styleUrls: ['./passenger-info.component.css']
})
export class PassengerInfoComponent implements OnInit {

  showModal = false;
  loggedIn = false;

  constructor(
    public stepService: ReservationStepsService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const savedPassenger = this.stepService.passengerInfo;
    if (savedPassenger?.userId) {
      this.loggedIn = true;
      return;
    }

    const user = this.auth.getCurrentUser();
    if (user) {
      const shouldAutoAdvance = !this.stepService.steps.passengerInfo;
      this.applyUser(user, shouldAutoAdvance);
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  modalLoggedIn(user: any) {
    this.applyUser(user, true);
    this.showModal = false;
  }

  private applyUser(user: any, navigateNext: boolean) {
    this.loggedIn = true;
    this.auth.setCurrentUser(user);

    this.stepService.passengerInfo = {
      userId: user.userId,
      name: user.fullName,
      nationalId: user.tckn,
      email: user.email
    };

    this.stepService.completeStep('passengerInfo');

    if (navigateNext) {
      this.stepService.setActiveStep('seatSelection');
      const route = this.stepService.getStepRoute('seatSelection');
      this.router.navigate(['/customer', route]);
    }
  }

  logoutPassenger() {
    this.auth.logout();
    this.loggedIn = false;
  }

  continue() {
    if (!this.stepService.passengerInfo?.userId) {
      return;
    }

    this.stepService.completeStep('passengerInfo');
    this.stepService.setActiveStep('seatSelection');
    const route = this.stepService.getStepRoute('seatSelection');
    this.router.navigate(['/customer', route]);
  }

}
