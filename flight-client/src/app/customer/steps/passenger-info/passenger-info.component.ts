import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';
import { ReservationStepsService } from '../../../services/reservation-steps.service';

@Component({
  selector: 'app-passenger-info',
  standalone: true,
  imports: [CommonModule, AuthModalComponent],
  templateUrl: './passenger-info.component.html',
  styleUrls: ['./passenger-info.component.css']
})
export class PassengerInfoComponent {

  showModal = false;
  loggedIn = false;

  constructor(public stepService: ReservationStepsService) {}

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

modalLoggedIn(user: any) {
  this.loggedIn = true;
  this.showModal = false;

  this.stepService.passengerInfo = {
    userId: user.userId,     // 🔥 DÜZELTİLDİ
    name: user.fullName,     // 🔥 DÜZELTİLDİ
    email: user.email
  };

  this.stepService.completeStep('passengerInfo');
  this.stepService.setActiveStep('seatSelection');
}


}
