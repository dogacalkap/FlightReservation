import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-flights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-flights.component.html',
  styleUrls: ['./my-flights.component.css']
})
export class MyFlightsComponent implements OnInit {

  tickets: any[] = [];
  user: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {

    // Storage'daki customerUser
    const stored = localStorage.getItem("customerUser");
    if (!stored) {
      console.log("customerUser bulunamadı.");
      return;
    }

    this.user = JSON.parse(stored);

    // userId backend'in beklediği anahtar
    const userId = this.user.userId;
    if (!userId) {
      console.log("customerUser içinde userId bulunamadı.");
      return;
    }

    // UserId üzerinden ticket çek
    this.http.get<any[]>(`http://localhost:5096/api/TicketsApi/user/${userId}`)
      .subscribe({
        next: (res) => {
          console.log("MY FLIGHTS RESPONSE:", res);
          this.tickets = res;   // → artık doğru geliyor
        },
        error: (err) => console.error("MyFlights error:", err)
      });
  }
}
