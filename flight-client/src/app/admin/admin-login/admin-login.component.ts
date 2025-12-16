import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../shared/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LottieComponent, TranslatePipe],
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

  adminLottie = {
    path: "https://lottie.host/40f4975f-d0f9-4c3a-8412-72acb43dfb77/OguCzCvY9B.json"
  };

  constructor(
    private http: HttpClient,
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
      this.http.post<any>("http://localhost:5096/api/AdminAuth/login", {
        email: this.email,
        password: this.password
      }).subscribe({
        next: (res: any) => {
          localStorage.setItem("admin_token", res.token);
          this.router.navigate(['/admin/airports']);
        },
        error: () => {
          this.errorMessage = this.i18n.translate('adminLogin.errorAdmin');
        }
      });
    } else {
      this.auth.login(this.email, this.password).subscribe({
        next: (res) => {
          const user = {
            userId: res.userId,
            fullName: res.fullName,
            email: res.email
          };
          this.auth.setCurrentUser(user);
          // Yolcu akışına yönlendir
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

}
