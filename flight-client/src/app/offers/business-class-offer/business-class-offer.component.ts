// src/app/offers/business-class-offer/business-class-offer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-business-class-offer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './business-class-offer.component.html',
  styleUrls: ['./business-class-offer.component.css']
})
export class BusinessClassOfferComponent { }
