import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight } from '../models/flight';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerFlightService {

  private apiUrl = `${environment.apiBaseUrl}/api/FlightsApi`;

  constructor(private http: HttpClient) {}

  getFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(this.apiUrl);
  }
}
