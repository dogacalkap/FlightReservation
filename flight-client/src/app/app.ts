import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// ⭐ Globe bileşenini uygulama köküne tanıtıyoruz

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('flight-client');
}
