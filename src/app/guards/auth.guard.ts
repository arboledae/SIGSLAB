import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const allowedRole = route.data['role'] as 'docente' | 'jefe-soporte' | 'tecnico';
    if (!allowedRole) {
      return true;
    }
    return this.authService.checkAuth(allowedRole);
  }
}
