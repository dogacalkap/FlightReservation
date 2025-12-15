import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { SeatAvailabilityComponent } from '../customer/steps/seat-availability/seat-availability.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { ContactBlockComponent } from '../shared/contact-block/contact-block.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    LottieComponent,
    SeatAvailabilityComponent,
    NavbarComponent,
    ContactBlockComponent
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {

  flightAnimation: AnimationOptions = {
    path: 'assets/lottie/flight.json'
  };
}
