import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Airport } from '../models/airport';

@Injectable({
  providedIn: 'root'
})
export class AirportLookupService {

  private apiUrl = 'http://localhost:5096/api/AirportsApi';

  constructor(private http: HttpClient) {}

  // Sadece UI tarafında liste almak için
  getAirports(): Observable<Airport[]> {
    return this.http.get<Airport[]>(this.apiUrl);
  }
}
