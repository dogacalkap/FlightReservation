import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  @Output() close = new EventEmitter<void>();   
  @Output() success = new EventEmitter<any>();   // İstersen step’lere emit edersin

  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef  
  ) {
    this.loginForm = this.fb.group({
      // username alanına sen zaten email yazıyorsun
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.error = null;

    if (this.loginForm.invalid) {
      this.error = 'Kullanıcı adı ve şifre zorunludur.';
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
        this.error = 'Hatalı giriş.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCloseClick() {
    this.close.emit();
  }
}
