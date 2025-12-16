import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { TranslatePipe } from '../../shared/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  @Output() close = new EventEmitter<void>();   
  @Output() success = new EventEmitter<any>();   // İstersen step’lere emit edersin

  loginForm: FormGroup;
  registerForm: FormGroup;
  mode: 'login' | 'register' = 'login';
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private i18n: TranslationService
  ) {
    this.loginForm = this.fb.group({
      // username alanına sen zaten email yazıyorsun
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      nationalId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.error = null;

    if (this.loginForm.invalid) {
      this.error = this.i18n.translate('customerLogin.login.error');
      return;
    }

    const { username, password } = this.loginForm.value;
    this.loading = true;

    // AuthApiController.Login → Email + Password bekliyor.
    this.auth.login(username, password).subscribe({
      next: (res) => {
        console.log("CUSTOMER LOGIN RESPONSE:", res);

        // Backend login’ini şu şekilde değiştirdik:
        // return Ok(new { userId = user.Id, email = user.Email, fullName = user.FullName });
        const user = {
        userId: res.userId,
        fullName: res.fullName,
        email: res.email
      };


        this.auth.setCurrentUser(user);

        // İstersen step için bunu kullanırsın
        this.success.emit(user);

        this.loading = false;

        // İstersen buradan redirect de yapabilirsin, ama step içi login ise gerek yok:
        // this.router.navigate(['/customer']);
      },
      error: () => {
        this.error = this.i18n.translate('customerLogin.login.errorFailed');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onRegisterSubmit() {
    this.error = null;

    if (this.registerForm.invalid) {
      this.error = this.i18n.translate('customerLogin.register.error');
      return;
    }

    const values = this.registerForm.value;
    this.loading = true;

    this.auth.register(values).subscribe({
      next: () => {
        this.loading = false;
        // Başarılı kayıt sonrası login sekmesine dön ve email’i doldur
        this.mode = 'login';
        this.loginForm.patchValue({ username: values.email });
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = this.i18n.translate('customerLogin.register.errorFailed');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  switchMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.error = null;
  }

  onCloseClick() {
    this.close.emit();
  }
}
