import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private supabase: SupabaseService, private router: Router) {}

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
    // Inicia sesión usando Supabase Auth con la contraseña por defecto '123456' para el MVP
    return from(
      this.supabase.client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: '123456'
      })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data.user) {
          throw new Error('Usuario no encontrado.');
        }
        // Obtener el perfil extendido (nombre, rol) desde la tabla de perfiles
        return from(
          this.supabase.client
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
        );
      }),
      map(({ data, error }) => {
        if (error || !data) {
          throw new Error(error?.message || 'Error al obtener el perfil de usuario.');
        }
        const loggedUser: User = {
          email: data.email,
          name: data.name,
          role: data.role as 'docente' | 'jefe-soporte' | 'tecnico'
        };
        this.setCurrentUser(loggedUser);
        return loggedUser;
      })
    );
  }

  logout(): void {
    from(this.supabase.client.auth.signOut()).subscribe({
      next: () => {
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      }
    });
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
