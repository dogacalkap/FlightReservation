import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ReservationStepsService } from './reservation-steps.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: number;
  userId?: number;
  fullName: string;
  tckn?: string;
  email: string;
  role: 'Admin' | 'Customer';
}

export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: AuthUser;
}

export interface PasswordResetRequestResponse {
  message: string;
  debugResetToken?: string | null;
  expiresAtUtc?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenStorageKey = 'auth_access_token';
  private readonly userStorageKey = 'auth_user';
  private apiUrl = `${environment.apiBaseUrl}/api/AuthApi`;
  private currentUser: AuthUser | null = null;
  user$ = new BehaviorSubject<AuthUser | null>(null);

  constructor(
    private http: HttpClient,
    private steps: ReservationStepsService,
    private router: Router
  ) {
    this.restoreSession();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((response) => this.setSession(response)));
  }

  loginAdmin(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/admin/login`, { email, password })
      .pipe(tap((response) => this.setSession(response)));
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, {
      fullName: data.fullName,
      tckn: data.nationalId,
      email: data.email,
      password: data.password
    });
  }

  setSession(response: AuthResponse) {
    this.currentUser = this.normalizeUser(response.user);
    localStorage.setItem(this.tokenStorageKey, response.accessToken);
    localStorage.setItem(this.userStorageKey, JSON.stringify(this.currentUser));
    localStorage.setItem("customerUser", JSON.stringify(this.currentUser));
    localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
    this.user$.next(this.currentUser);
  }

  setCurrentUser(user: AuthUser | any) {
    this.currentUser = this.normalizeUser(user);
    localStorage.setItem(this.userStorageKey, JSON.stringify(this.currentUser));
    localStorage.setItem("customerUser", JSON.stringify(this.currentUser));
    localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
    this.user$.next(this.currentUser);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  logout() {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.userStorageKey);
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("customerUser");
    this.currentUser = null;
    this.user$.next(null);
    this.steps.resetAll();
    this.router.navigate(['/landing']);
  }

  requestPasswordReset(body: { email: string }) {
    return this.http.post<PasswordResetRequestResponse>(`${this.apiUrl}/reset-password/request`, body);
  }

  resetPassword(body: { token: string; newPassword: string }) {
    return this.http.post(`${this.apiUrl}/reset-password`, body);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUser;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  getUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  private restoreSession() {
    const token = localStorage.getItem(this.tokenStorageKey);
    const userJson = localStorage.getItem(this.userStorageKey);

    if (!token || !userJson) {
      return;
    }

    try {
      this.currentUser = this.normalizeUser(JSON.parse(userJson) as AuthUser);
      this.user$.next(this.currentUser);
    } catch {
      localStorage.removeItem(this.tokenStorageKey);
      localStorage.removeItem(this.userStorageKey);
    }
  }

  private normalizeUser(user: AuthUser | any): AuthUser {
    const id = user.id ?? user.userId;

    return {
      id,
      userId: id,
      fullName: user.fullName,
      tckn: user.tckn ?? user.TCKN ?? user.nationalId,
      email: user.email,
      role: user.role ?? 'Customer'
    };
  }
}
