import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  login(email: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  checkAuth(allowedRole: 'docente' | 'jefe-soporte' | 'tecnico'): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }
    if (user.role !== allowedRole) {
      this.redirectByRole(user.role);
      return false;
    }
    return true;
  }

  redirectByRole(role: 'docente' | 'jefe-soporte' | 'tecnico'): void {
    if (role === 'docente') {
      this.router.navigate(['/docente']);
    } else if (role === 'jefe-soporte') {
      this.router.navigate(['/jefe']);
    } else if (role === 'tecnico') {
      this.router.navigate(['/tecnico']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
