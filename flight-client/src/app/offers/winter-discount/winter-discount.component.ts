// src/app/offers/winter-discount/winter-discount.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-winter-discount',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './winter-discount.component.html',
  styleUrls: ['./winter-discount.component.css']
})
export class WinterDiscountComponent { }
