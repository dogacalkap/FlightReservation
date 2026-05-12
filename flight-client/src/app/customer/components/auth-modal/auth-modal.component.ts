import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
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
export class AuthModalComponent implements OnInit {

  @Input() initialMode: 'login' | 'register' | 'forgot-step1' | 'forgot-step2' = 'login';
  @Input() registerOnly = false;

  @Output() closed = new EventEmitter<void>();
  @Output() loggedIn = new EventEmitter<any>();
  @Output() registered = new EventEmitter<{ email: string }>();

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
  resetToken = '';
  resetInfoMessage = '';
  newPassword = '';

  constructor(private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.mode = this.registerOnly ? 'register' : this.initialMode;
  }

  changeMode(m: any) {
    this.mode = m;
  }

  close() {
    this.closed.emit();
  }

  sanitizeNationalId(value: string) {
    return value.replace(/\D/g, '').slice(0, 11);
  }

  private isValidTckn(value: string) {
    return /^\d{11}$/.test(value);
  }

  onRegisterNationalIdInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.registerData.nationalId = this.sanitizeNationalId(input.value);
    input.value = this.registerData.nationalId;
  }

login() {
  if (!this.email || !this.password) {
    alert("Email and password cannot be empty.");
    return;
  }

  this.authService.login(this.email, this.password).subscribe({
    next: (res) => {
      this.loggedIn.emit(res.user);

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

    if (!this.isValidTckn(d.nationalId)) {
      alert("TCKN must be exactly 11 digits.");
      return;
    }

    if (d.password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    this.authService.register(d).subscribe({
      next: () => {
        alert("Registration successful!");
        this.registered.emit({ email: d.email });

        if (this.registerOnly) {
          this.close();
          return;
        }

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
    if (!this.resetEmail) {
      alert("Email cannot be empty.");
      return;
    }

    this.loadingStep1 = true;
    this.authService.requestPasswordReset({
      email: this.resetEmail
    }).subscribe({
      next: (response) => {
        this.resetToken = response.debugResetToken ?? '';
        this.resetInfoMessage = response.debugResetToken
          ? "Development token generated. You can continue below."
          : "If the account exists, reset instructions were sent.";
        this.mode = 'forgot-step2';
        this.loadingStep1 = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.loadingStep1 = false;
        alert(err.error?.message || "Password reset request failed.");
        this.cdr.detectChanges(); 
      }
    });
  }

  // RESET — STEP 2
  forgotSave() {
    if (!this.resetToken || !this.newPassword) {
      alert("Reset token and new password cannot be empty.");
      return;
    }

    if (this.newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    this.authService.resetPassword({
      token: this.resetToken,
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
