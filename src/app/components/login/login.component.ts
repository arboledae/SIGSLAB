import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  emailInput = '';
  passwordInput = '';
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.authService.redirectByRole(currentUser.role);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.emailInput || !this.passwordInput) {
      alert('Por favor, ingrese su correo y contraseña.');
      return;
    }
    this.authService.login(this.emailInput, this.passwordInput).subscribe({
      next: (userSession) => {
        this.authService.setCurrentUser(userSession);
        this.authService.redirectByRole(userSession.role);
      },
      error: (err) => {
        console.error('Detalles del error de login:', err);
        alert('Error al iniciar sesión: ' + (err.message || err));
      }
    });
  }
}
