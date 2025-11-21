import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
 
interface LoginResponse {
  csrf_token: string;
  expiration: number;  // seconds
}
 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  private BASE_URL = 'http://localhost:3000/bpm';
 
  private credentialsSubject = new BehaviorSubject<{ username: string, password: string } | null>(null);
  credentials$ = this.credentialsSubject.asObservable();
 
  constructor(private http: HttpClient, private router: Router) {}
 
  /** ----------------- BASIC AUTH ----------------- */
  setCredentials(username: string, password: string) {
    this.credentialsSubject.next({ username, password });
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
  }
 
  getBasicAuthHeader(): string {
    let username = localStorage.getItem('username');
    let password = localStorage.getItem('password');
    return `Basic ${btoa(`${username}:${password}`)}`;
  }
 
  /** ----------------- CSRF TOKEN ----------------- */
  getCSRFToken(): string | null {
    return localStorage.getItem('BPMCSRFToken');
  }
 
  getCSRFTokenExpiry(): number {
    return Number(localStorage.getItem('BPMCSRFTokenExpiry') ?? 0);
  }
 
  isAuthenticated(): boolean {
    const token = this.getCSRFToken();
    const expiry = this.getCSRFTokenExpiry();
    const now = Math.floor(Date.now() / 1000);
 
    if (!token) return false;
    if (expiry > now) return true;
 
    this.logout();
    return false;
  }

  getToken(): string | null {
    return localStorage.getItem('BPMCSRFToken');
  }
 
  /** ----------------- LOGIN ----------------- */
  login(username: string, password: string, requested_lifetime: number = 7200): Observable<LoginResponse> {
    // Headers for login request
    const headers = {
      BPMCSRFToken: this.getCSRFToken() || '',
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      'Content-Type': 'application/json'
    };
 
    const body = {
      refresh_groups: true,
      requested_lifetime
    };
 
    return this.http.post<LoginResponse>(`${this.BASE_URL}/system/login`, body, { headers })
      .pipe(
        tap((res: LoginResponse) => {
          // Store csrf_token
          localStorage.setItem('BPMCSRFToken', res.csrf_token);
 
          // Calculate expiration timestamp (current time + expiration in seconds)
          const expiryTimestamp = Math.floor(Date.now() / 1000) + (res.expiration ?? 7200);
          localStorage.setItem('BPMCSRFTokenExpiry', expiryTimestamp.toString());
 
          // Store username/password for future Basic Auth requests
          this.setCredentials(username, password);
        })
      );
  }
 
  /** ----------------- BPM HEADERS ----------------- */
  getBpmHeaders() {
    return {
      BPMCSRFToken: this.getCSRFToken() || '',
      Authorization: this.getBasicAuthHeader(),
      'Content-Type': 'application/json'
    };
  }
 
  /** ----------------- LOGOUT ----------------- */
  logout(): void {
    localStorage.removeItem('BPMCSRFToken');
    localStorage.removeItem('BPMCSRFTokenExpiry');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    this.credentialsSubject.next(null);
    this.router.navigate(['/login']);
  }
 
  /** ----------------- HELPERS ----------------- */
  get username(): string {
    return localStorage.getItem('username') ?? '';
  }
 
  get role(): string {
    return localStorage.getItem('role') ?? '';
  }
 
  hasRole(roles: string[]): boolean {
    return roles.includes(this.role);
  }
 
  hasUser(users: string[]): boolean {
    return users.includes(this.username);
  }
 
  canAccess(config: { users?: string[], roles?: string[] }): boolean {
    return (
      (config.users && config.users.includes(this.username)) ||
      (config.roles && config.roles.includes(this.role)) ||
      false
    );
  }
}
 
 