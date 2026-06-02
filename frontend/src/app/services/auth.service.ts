import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;

  currentUser  = signal<User | null>(this.storedUser());
  isAuthenticated = signal<boolean>(!!this.getToken());

  constructor(private http: HttpClient, private router: Router) {}

  register(data: Partial<User> & { password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
      tap(r => this.persist(r))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(r => this.persist(r))
    );
  }

  logout(): void {
    localStorage.removeItem('nd_token');
    localStorage.removeItem('nd_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('nd_token');
  }

  updateProfile(data: Partial<User>): Observable<{ success: boolean; user: User }> {
    return this.http.put<{ success: boolean; user: User }>(`${this.API}/profile`, data).pipe(
      tap(r => {
        localStorage.setItem('nd_user', JSON.stringify(r.user));
        this.currentUser.set(r.user);
      })
    );
  }

  private persist(r: AuthResponse): void {
    localStorage.setItem('nd_token', r.token);
    localStorage.setItem('nd_user', JSON.stringify(r.user));
    this.currentUser.set(r.user);
    this.isAuthenticated.set(true);
  }

  private storedUser(): User | null {
    const u = localStorage.getItem('nd_user');
    return u ? JSON.parse(u) : null;
  }
}
