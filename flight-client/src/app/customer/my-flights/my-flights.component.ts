import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ContactBlockComponent } from '../../shared/contact-block/contact-block.component';

@Component({
  selector: 'app-my-flights',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ContactBlockComponent],
  templateUrl: './my-flights.component.html',
  styleUrls: ['./my-flights.component.css']
})
export class MyFlightsComponent implements OnInit {

  tickets: any[] = [];
  user: any;

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {

  const stored = localStorage.getItem("customerUser");
  if (!stored) {
    console.log("customerUser bulunamadı.");
    return;
  }

  console.log("RAW customerUser:", stored); // 👈 EKLE

  this.user = JSON.parse(stored);
  console.log("PARSED customerUser:", this.user); // 👈 BUNU DA EKLE

  // Mümkün olan tüm id alanlarını dene
  const userId =
    this.user.id ??
    this.user.userId ??
    this.user.user?.id ??
    this.user.user?.userId;

  console.log("ÇÖZÜLEN userId:", userId); // 👈 Bakalım ne çıkacak

  if (!userId) {
    console.log("customerUser içinde id veya userId bulunamadı.");
    return;
  }

  this.http.get<any[]>(`http://localhost:5096/api/TicketsApi/user/${userId}`)
    .subscribe({
      next: (res) => {
        console.log("MY FLIGHTS RESPONSE:", res);
        this.tickets = res;
        this.cdRef.detectChanges();
      },
      error: (err) => console.error("MyFlights error:", err)
    });
}


  // ====== BİLET İPTAL ======
  cancelTicket(ticketId: number) {
    if (!confirm("Bu bileti iptal etmek istediğine emin misin?")) {
      return;
    }

    this.http.delete(`http://localhost:5096/api/TicketsApi/${ticketId}`)
      .subscribe({
        next: () => {
          // Ekrandan da kaldır
          this.tickets = this.tickets.filter(t => t.id !== ticketId);
        },
        error: (err) => {
          console.error("Ticket cancel error:", err);
        }
      });
  }
}
