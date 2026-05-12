import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeatsService {

  private apiUrl = `${environment.apiBaseUrl}/api/SeatOccupation`;

  constructor(private http: HttpClient) {}

  // Uçuşun tüm koltuklarını çek
  getSeats(flightId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${flightId}`);
  }

  // Koltuk seç
  selectSeat(flightId: number, seatNumber: string) {
    return this.http.post(`${this.apiUrl}/reserve`, {
      flightId,
      seatNumber
    });
  }
}
