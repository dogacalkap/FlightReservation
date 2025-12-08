import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private api = "http://localhost:5096/api/ContactApi";

  constructor(private http: HttpClient) {}

  sendMessage(data: any) {
    return this.http.post(this.api, data);
  }
}
