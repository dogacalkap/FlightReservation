import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  links = [
    { label: 'Uçuşlarım', path: '/customer/my-flights' },
    { label: 'Fırsatlar', path: '/offers' },
    { label: 'Hakkımızda', path: '/about' }
  ];
}
