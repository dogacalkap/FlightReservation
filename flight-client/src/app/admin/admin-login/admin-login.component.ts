import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { AuthService } from '../../services/auth.service';
import { AuthModalComponent } from '../../customer/components/auth-modal/auth-modal.component';
import { TranslatePipe } from '../../shared/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LottieComponent, TranslatePipe, AuthModalComponent],
  providers: [
    provideLottieOptions({ player: () => player })
  ],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {

  email = "";
  password = "";
  errorMessage = "";
  mode: 'admin' | 'customer' = 'admin';
  showCustomerAuthPopup = false;

  adminLottie = {
    path: "https://lottie.host/40f4975f-d0f9-4c3a-8412-72acb43dfb77/OguCzCvY9B.json"
  };

  constructor(
    private router: Router,
    private auth: AuthService,
    private i18n: TranslationService
  ) {}

  setMode(m: 'admin' | 'customer') {
    this.mode = m;
    this.errorMessage = "";
  }

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = this.i18n.translate('adminLogin.error');
      return;
    }

    if (this.mode === 'admin') {
      this.auth.loginAdmin(this.email, this.password).subscribe({
        next: () => {
          this.router.navigate(['/admin/airports']);
        },
        error: () => {
          this.errorMessage = this.i18n.translate('adminLogin.errorAdmin');
        }
      });
    } else {
      this.auth.login(this.email, this.password).subscribe({
        next: () => {
          this.router.navigate(['/customer']);
        },
        error: () => {
          this.errorMessage = this.i18n.translate('adminLogin.errorCustomer');
        }
      });
    }
  }

  goHome() {
  this.router.navigate(['/landing']);
}

  goToCustomerRegister() {
    this.showCustomerAuthPopup = true;
  }

  closeCustomerAuthPopup() {
    this.showCustomerAuthPopup = false;
  }

  customerRegistered(event: { email: string }) {
    this.email = event.email;
    this.mode = 'customer';
  }

  customerAuthSuccess() {
    this.showCustomerAuthPopup = false;
    this.router.navigate(['/customer']);
  }

}
