import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  currentUser: any = null;

  constructor(private auth: AuthService, private i18n: TranslationService) {
    this.currentUser = this.auth.getCurrentUser();
    this.auth.user$.subscribe(u => this.currentUser = u);
  }

  get links() {
    const baseLinks = [
      { label: 'nav.flights', path: '/customer/my-flights' },
      { label: 'nav.offers', path: '/offers' },
      { label: 'nav.about', path: '/about' }
    ];

    if (this.auth.isAdmin()) {
      return [
        { label: 'Admin Panel', path: '/admin/airports' },
        { label: 'Bilet Al', path: '/customer' },
        ...baseLinks
      ];
    }

    return baseLinks;
  }

  logout() {
    this.auth.logout();
    this.currentUser = null;
  }

  setLang(lang: 'tr' | 'en') {
    this.i18n.setLang(lang);
  }
}
