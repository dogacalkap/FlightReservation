import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight } from '../models/flight';

@Injectable({
  providedIn: 'root'
})
export class CustomerFlightService {

  private apiUrl = 'http://localhost:5096/api/FlightsApi';

  constructor(private http: HttpClient) {}

  getFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(this.apiUrl);
  }
}
