import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private api = `${environment.apiBaseUrl}/api/ContactApi`;

  constructor(private http: HttpClient) {}

  sendMessage(data: any) {
    return this.http.post(`${this.api}/send`, data);
  }
}
