import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Airport } from '../models/airport';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AirportLookupService {

  private apiUrl = `${environment.apiBaseUrl}/api/AirportsApi`;

  constructor(private http: HttpClient) {}

  // Sadece UI tarafında liste almak için
  getAirports(): Observable<Airport[]> {
    return this.http.get<Airport[]>(this.apiUrl);
  }
}
