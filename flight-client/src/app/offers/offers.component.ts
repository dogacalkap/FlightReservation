import { Component } from '@angular/core';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { ContactBlockComponent } from '../shared/contact-block/contact-block.component';
// JSON animasyon importları
import planeAnim from '../../assets/lottie/plane.json';
import discountAnim from '../../assets/lottie/discount.json';
import businessAnim from '../../assets/lottie/business.json';
import studentAnim from '../../assets/lottie/student.json';

import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [LottieComponent, RouterLink, NavbarComponent, ContactBlockComponent, TranslatePipe],
  providers: [
    provideLottieOptions({
      player: () => player
    })
  ],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent {

  planeAnimation = {
    animationData: planeAnim,
    loop: true,
    autoplay: true
  };

  discountAnimation = {
    animationData: discountAnim,
    loop: true,
    autoplay: true
  };

  businessAnimation = {
    animationData: businessAnim,
    loop: true,
    autoplay: true
  };

  studentAnimation = {
    animationData: studentAnim,
    loop: true,
    autoplay: true
  };

}
