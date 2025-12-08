// src/app/offers/winter-discount/winter-discount.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-winter-discount',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './winter-discount.component.html',
  styleUrls: ['./winter-discount.component.css']
})
export class WinterDiscountComponent { }
