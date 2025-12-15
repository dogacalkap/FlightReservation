import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthModalComponent } from '../../components/auth-modal/auth-modal.component';
import { ReservationStepsService } from '../../../services/reservation-steps.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-passenger-info',
  standalone: true,
  imports: [CommonModule, AuthModalComponent],
  templateUrl: './passenger-info.component.html',
  styleUrls: ['./passenger-info.component.css']
})
export class PassengerInfoComponent implements OnInit {

  showModal = false;
  loggedIn = false;

  constructor(
    public stepService: ReservationStepsService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.applyUser(user);
    }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  modalLoggedIn(user: any) {
    this.applyUser(user);
    this.showModal = false;
  }

  private applyUser(user: any) {
    this.loggedIn = true;
    this.stepService.passengerInfo = {
      userId: user.userId,
      name: user.fullName,
      email: user.email
    };

    this.stepService.completeStep('passengerInfo');
    this.stepService.setActiveStep('seatSelection');
  }


}
