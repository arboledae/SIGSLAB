import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly MOCK_USERS: (User & { password?: string })[] = [
    { email: 'docente@sigslab.com', password: '123', name: 'Dr. Héctor Flores', role: 'docente' },
    { email: 'jefe@sigslab.com', password: '123', name: 'Ing. Laura Ruíz', role: 'jefe-soporte' },
    { email: 'juan.perez@sigslab.com', password: '123', name: 'Juan Pérez (Bolsista)', role: 'tecnico' },
    { email: 'maria.gomez@sigslab.com', password: '123', name: 'María Gómez (Técnico)', role: 'tecnico' },
    { email: 'carlos.lopez@sigslab.com', password: '123', name: 'Carlos López (Bolsista)', role: 'tecnico' }
  ];

  constructor(private router: Router) { }

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

  login(email: string, password: string): Observable<User> {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.MOCK_USERS.find(u => u.email === cleanEmail);

    if (!user) {
      return throwError(() => new Error('Usuario no encontrado.'));
    }

    if (user.password !== password) {
      return throwError(() => new Error('Contraseña incorrecta.'));
    }

    // Retornar clon de usuario sin la contraseña
    const loggedUser: User = {
      email: user.email,
      name: user.name,
      role: user.role
    };

    this.setCurrentUser(loggedUser);
    return of(loggedUser);
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
