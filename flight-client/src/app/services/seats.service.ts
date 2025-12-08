import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeatsService {

  private apiUrl = 'http://localhost:5096/api/SeatsApi';

  constructor(private http: HttpClient) {}

  // Uçuşun tüm koltuklarını çek
  getSeats(flightId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/flight/${flightId}`);
  }

  // Koltuk seç
  selectSeat(flightId: number, seatNumber: string, userId: number) {
    return this.http.post(`${this.apiUrl}/select`, {
      flightId,
      seatNumber,
      userId
    });
  }
}
