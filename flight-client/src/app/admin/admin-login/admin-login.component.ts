import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LottieComponent],
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

  adminLottie = {
    path: "https://lottie.host/40f4975f-d0f9-4c3a-8412-72acb43dfb77/OguCzCvY9B.json"
  };

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = "Lütfen tüm alanları doldurunuz.";
      return;
    }

    this.http.post<any>("http://localhost:5096/api/AdminAuth/login", {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
      localStorage.setItem("admin_token", res.token);
      this.router.navigate(['/admin/airports']);
    },
  error: () => {
    this.errorMessage = "Hatalı admin bilgisi.";
  }
    });
  }

  goHome() {
  this.router.navigate(['/landing']);
}

}
