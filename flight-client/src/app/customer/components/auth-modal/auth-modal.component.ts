import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core'; // <-- cdr import'u burada olmalı
@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {

  @Output() closed = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<any>();

  mode: 'login' | 'register' | 'forgot-step1' | 'forgot-step2' = 'login';

  // LOGIN
  email = '';
  password = '';

  // REGISTER
  registerData = {
    fullName: '',
    nationalId: '',
    email: '',
    password: ''
  };

  // RESET PASSWORD
  resetEmail = '';
  resetTCKN = '';
  newPassword = '';

  constructor(private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  changeMode(m: any) {
    this.mode = m;
  }

  close() {
    this.closed.emit();
  }
login() {
  if (!this.email || !this.password) {
    alert("Email and password cannot be empty.");
    return;
  }

  this.authService.login(this.email, this.password).subscribe({
    next: (res) => {
      const user = {
        userId: res.userId,
        fullName: res.fullName,
        email: res.email
      };

      localStorage.setItem("customerUser", JSON.stringify(user));
      this.loggedIn.emit(user);

      this.close();
    },
    error: (err) => {
      alert(err.error || "Incorrect email or password.");
    }
  });
}



  // REGISTER
  register() {
    const d = this.registerData;

    if (!d.fullName || !d.nationalId || !d.email || !d.password) {
      alert("All fields are required.");
      return;
    }

    this.authService.register(d).subscribe({
      next: () => {
        alert("Registration successful!");
        this.email = d.email;
        this.mode = 'login';
      },
      error: (err) => {
        alert(err.error || "Registration failed.");
      }
    });
  }

  loadingStep1 = false;
  // RESET — STEP 1
  forgotCheck() {
    // ... (mevcut loading ve boş kontrolü)

    this.loadingStep1 = true;
    this.authService.resetPasswordCheck({
      email: this.resetEmail,
      tckn: this.resetTCKN
    }).subscribe({
      next: () => {
        alert("Identity verified. Please enter a new password.");
        this.mode = 'forgot-step2';
        this.loadingStep1 = false;
        
        // 💥 KRİTİK: Değişiklikleri hemen uygula
        this.cdr.detectChanges(); 

      },
      error: (err) => {
        this.loadingStep1 = false;
        alert(err.error || "Email or TCKN is incorrect.");
        
        // 💥 Hata durumunda da butonu aktif etmek için güncelle
        this.cdr.detectChanges(); 
      }
    });
  }

  // RESET — STEP 2
  forgotSave() {
    if (!this.newPassword) {
      alert("New password cannot be empty.");
      return;
    }

    this.authService.resetPassword({
      email: this.resetEmail,
      tckn: this.resetTCKN,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        alert("Password updated. Please login.");
        this.mode = 'login';
      },
      error: (err) => {
        alert(err.error || "Password reset failed.");
      }
    });
  }
}
