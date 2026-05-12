import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

  @Input() startMode: 'login' | 'register' | 'forgot-request' | 'reset' | null = null;
  @Output() close = new EventEmitter<void>();   
  @Output() success = new EventEmitter<any>();   // İstersen step’lere emit edersin

  loginForm: FormGroup;
  registerForm: FormGroup;
  forgotRequestForm: FormGroup;
  resetPasswordForm: FormGroup;
  mode: 'login' | 'register' | 'forgot-request' | 'reset' = 'login';
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
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
      nationalId: ['', [
        Validators.required,
        Validators.pattern(/^\d{11}$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.forgotRequestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetPasswordForm = this.fb.group({
      token: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.route.queryParamMap.subscribe((params) => {
      if (this.startMode) {
        this.mode = this.startMode;
        return;
      }

      const token = params.get('token');

      if (token) {
        this.mode = 'reset';
        this.resetPasswordForm.patchValue({ token });
        return;
      }

      if (params.get('mode') === 'register') {
        this.mode = 'register';
      }
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
        this.success.emit(res.user);

        this.loading = false;
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

  onForgotRequestSubmit() {
    this.error = null;

    if (this.forgotRequestForm.invalid) {
      this.error = 'Lutfen gecerli email girin.';
      return;
    }

    this.loading = true;
    this.auth.requestPasswordReset(this.forgotRequestForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.mode = 'reset';
        this.error = response.debugResetToken
          ? `Development reset token hazirlandi: ${response.debugResetToken}`
          : 'Sifirlama talebi alindi. Link veya token e-posta ile gonderildi.';

        if (response.debugResetToken) {
          this.resetPasswordForm.patchValue({ token: response.debugResetToken });
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Sifre sifirlama talebi basarisiz oldu.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onResetPasswordSubmit() {
    this.error = null;

    if (this.resetPasswordForm.invalid) {
      this.error = 'Token ve yeni sifre gerekli.';
      return;
    }

    this.loading = true;
    this.auth.resetPassword(this.resetPasswordForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.mode = 'login';
        this.error = 'Sifre guncellendi. Simdi giris yapabilirsiniz.';
        this.resetPasswordForm.reset();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Token gecersiz veya suresi dolmus.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  switchMode(mode: 'login' | 'register' | 'forgot-request' | 'reset') {
    this.mode = mode;
    this.error = null;
  }

  onNationalIdInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '').slice(0, 11);
    this.registerForm.get('nationalId')?.setValue(sanitized, { emitEvent: false });
    input.value = sanitized;
  }

  onCloseClick() {
    this.close.emit();
  }
}
