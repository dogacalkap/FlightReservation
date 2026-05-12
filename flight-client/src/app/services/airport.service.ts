import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Airport } from '../models/airport';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AirportService {

  // ✔ MacOS büyük/küçük harfe duyarlı olduğu için doğru API endpoint
  private apiUrl = `${environment.apiBaseUrl}/api/AirportsApi`;

  constructor(private http: HttpClient) {}

  // Tüm havaalanlarını getir
  getAirports(): Observable<Airport[]> {
    return this.http.get<Airport[]>(this.apiUrl);
  }

  // Tek havaalanı getir
  getAirport(id: number): Observable<Airport> {
    return this.http.get<Airport>(`${this.apiUrl}/${id}`);
  }

  // Havaalanı oluştur
  createAirport(airport: Airport): Observable<Airport> {
    return this.http.post<Airport>(this.apiUrl, airport);
  }

  // Havaalanı güncelle
  updateAirport(airport: Airport): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${airport.id}`, airport);
  }

  // Havaalanı sil
  deleteAirport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
