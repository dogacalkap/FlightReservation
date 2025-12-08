import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:5096/api/AuthApi';
  private currentUser: any = null;

  constructor(private http: HttpClient) {}

  // LOGIN → backend email + password bekliyor
  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }

  // REGISTER
  register(data: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, {
      fullName: data.fullName,
      tckn: data.tckn,
      email: data.email,
      password: data.password
    });
  }

  // ======================================
  // USER VERISI
  // ======================================
  setCurrentUser(user: any) {
    this.currentUser = user;

    // MyFlights bunu okuyor
    localStorage.setItem("customerUser", JSON.stringify(user));

    // Genel kullanım için de tutalım
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  // Customer verisini doğru şekilde oku
  getCurrentUser() {
    if (this.currentUser) return this.currentUser;

    const stored = localStorage.getItem("customerUser");
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }

    return null;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("customerUser"); // ❗ Eksikti, eklendi
    this.currentUser = null;
  }

  // ======================================
  // PASSWORD RESET (dokunmuyoruz)
  // ======================================
  resetPasswordCheck(body: { email: string; tckn: string }) {
    return this.http.post<any>(`${this.apiUrl}/reset-password/check`, body);
  }

  resetPassword(body: { email: string; tckn: string; newPassword: string }) {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, body);
  }
}
