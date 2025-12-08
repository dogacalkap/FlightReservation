import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Flight } from '../models/flight';
import { FlightCreateDto } from '../models/flight-create-dto';

@Injectable({
  providedIn: 'root'
})
export class FlightService {

  private apiUrl = 'http://localhost:5096/api/FlightsApi';

  constructor(private http: HttpClient) {}

  // CUSTOMER & ADMIN - GET
  getFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(this.apiUrl);
  }

  getFlight(id: number): Observable<Flight> {
    return this.http.get<Flight>(`${this.apiUrl}/${id}`);
  }

  // ADMIN - CREATE (DTO)
  createFlight(flight: FlightCreateDto): Observable<Flight> {
    return this.http.post<Flight>(this.apiUrl, flight);
  }

  // ADMIN - UPDATE (DTO)
  updateFlight(flight: FlightCreateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${flight.id}`, flight);
  }

  // ADMIN - DELETE
  deleteFlight(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
searchFlights(fromId: number | null, toId: number | null, date: string | null) {
  return this.getFlights().pipe(
    map((flights) => {
      return flights.filter(f => {

        let match = true;

        if (fromId) match = match && f.fromAirportId === fromId;
        if (toId)   match = match && f.toAirportId === toId;

        if (date) {
          const flightDate = new Date(f.departureTime).toISOString().split('T')[0];
          const selectedDate = new Date(date).toISOString().split('T')[0];
          match = match && flightDate === selectedDate;
        }

        return match;
      });
    })
  );
}



}
