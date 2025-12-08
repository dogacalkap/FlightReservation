import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterModule,
    LottieComponent // <-- EKLENDİ
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {

  flightAnimation: AnimationOptions = {
    path: 'assets/lottie/flight.json'
  };

}
