import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ContactBlockComponent } from '../../shared/contact-block/contact-block.component';
import { TranslatePipe } from '../../shared/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-my-flights',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ContactBlockComponent, TranslatePipe],
  templateUrl: './my-flights.component.html',
  styleUrls: ['./my-flights.component.css']
})
export class MyFlightsComponent implements OnInit {

  tickets: any[] = [];
  user: any;
  loading = true;
  error: string | null = null;
  cancellingId: number | null = null;

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private i18n: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.error = null;

    const stored = localStorage.getItem("customerUser");
    if (!stored) {
      this.error = this.i18n.translate('myFlights.error.notFound');
      this.loading = false;
      return;
    }

    this.user = JSON.parse(stored);

    // Mümkün olan tüm id alanlarını dene
    const userId =
      this.user.id ??
      this.user.userId ??
      this.user.user?.id ??
      this.user.user?.userId;

    if (!userId) {
      this.error = this.i18n.translate('myFlights.error.noId');
      this.loading = false;
      return;
    }

    this.http.get<any[]>(`http://localhost:5096/api/TicketsApi/user/${userId}`)
      .subscribe({
        next: (res) => {
          this.tickets = res;
          this.loading = false;
          this.cdRef.detectChanges();
        },
        error: () => {
          this.error = this.i18n.translate('myFlights.error.loading');
          this.loading = false;
        }
      });
  }

  get totalSpent(): number {
    return this.tickets.reduce((sum, t) => sum + (t.finalPrice ?? 0), 0);
  }


  // ====== BİLET İPTAL ======
  cancelTicket(ticketId: number) {
    if (!confirm(this.i18n.translate('myFlights.confirmCancel'))) {
      return;
    }

    this.cancellingId = ticketId;

    this.http.delete(`http://localhost:5096/api/TicketsApi/${ticketId}`)
      .subscribe({
        next: () => {
          // Ekrandan da kaldır
          this.tickets = this.tickets.filter(t => t.id !== ticketId);
          this.cdRef.detectChanges();
        },
        error: () => {
          this.error = this.i18n.translate('myFlights.error.cancel');
          this.cdRef.detectChanges();
        },
        complete: () => {
          this.cancellingId = null;
          this.cdRef.detectChanges();
        }
      });
  }
}
