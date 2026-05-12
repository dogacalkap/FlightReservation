import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../../shared/translate.pipe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {

  messages: any[] = [];
  loading = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

 ngOnInit(): void {
  this.http.get<any[]>(`${environment.apiBaseUrl}/api/ContactApi`)
    .subscribe({
      next: data => {
        console.log("API DATA:", data); 
        this.messages = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
}

}
