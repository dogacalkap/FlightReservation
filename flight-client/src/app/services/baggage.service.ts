import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SaveBaggageSelectionRequest {
  flightId: number;
  baggageCount: number;
  price: number;
}

export interface SaveBaggageSelectionResponse {
  message: string;
  id: number;
  baggageCount: number;
  price: number;
}

export interface BaggageSelection {
  id: number;
  userId: number;
  flightId: number;
  baggageCount: number;
  price: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BaggageService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/BaggageSelectionsApi`;

  constructor(private readonly http: HttpClient) {}

  saveSelection(body: SaveBaggageSelectionRequest): Observable<SaveBaggageSelectionResponse> {
    return this.http.post<SaveBaggageSelectionResponse>(this.apiUrl, body);
  }

  getMySelections(): Observable<BaggageSelection[]> {
    return this.http.get<BaggageSelection[]>(`${this.apiUrl}/me`);
  }

  getMySelectionForFlight(flightId: number): Observable<BaggageSelection | null> {
    return this.getMySelections().pipe(
      map((items) => items.find((item) => item.flightId === flightId) ?? null)
    );
  }
}
