import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    TranslatePipe
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

  constructor(private auth: AuthService, private router: Router) {}

  logout() {
  console.log("LOGOUT ÇAĞRILDI!!!");
  localStorage.removeItem("admin_token");
  this.router.navigate(['/login']);
}

}
