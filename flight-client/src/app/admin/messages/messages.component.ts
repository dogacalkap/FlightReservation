import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {

  messages: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

 ngOnInit(): void {
  this.http.get<any[]>("http://localhost:5096/api/ContactApi")
    .subscribe({
      next: data => {
        console.log("API DATA:", data); 
        this.messages = data;
        this.loading = false;
      }
    });
}

}
