import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-details.component.html',
  styleUrls: ['./about-details.component.css']
})
export class AboutDetailsComponent {

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/about']);
  }
}
