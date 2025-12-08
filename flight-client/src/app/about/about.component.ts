import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent, provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { RouterModule } from '@angular/router'; 
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, LottieComponent, RouterModule],
  providers: [
    provideLottieOptions({
      player: () => player
    })
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  
  buildingAnimation = {
    path: 'https://lottie.host/09d1db7c-5a65-4f84-a58e-5fcac6d25b35/yxtT5LtYpK.json'
  };

}
