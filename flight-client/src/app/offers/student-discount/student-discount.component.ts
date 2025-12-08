// src/app/offers/student-discount/student-discount.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-student-discount',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-discount.component.html',
  styleUrls: ['./student-discount.component.css']
})
export class StudentDiscountComponent { }
