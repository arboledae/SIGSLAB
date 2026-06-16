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
  roles = [
    { value: 'docente', email: 'docente@sigslab.edu', name: 'Prof. Sofia Arboleda' },
    { value: 'jefe-soporte', email: 'jefe@sigslab.edu', name: 'Ing. Marcos Paz (Jefe de Soporte)' },
    { value: 'tecnico', email: 'tecnico@sigslab.edu', name: 'Juan Pérez (Bolsista)' }
  ];

  selectedRoleValue = 'docente';
  emailInput = 'docente@sigslab.edu';
  passwordInput = 'password123';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.authService.redirectByRole(currentUser.role);
    }
  }

  onRoleChange(event: any): void {
    const roleValue = event.target.value;
    const roleObj = this.roles.find(r => r.value === roleValue);
    if (roleObj) {
      this.emailInput = roleObj.email;
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const roleObj = this.roles.find(r => r.value === this.selectedRoleValue);
    if (roleObj) {
      this.authService.login(roleObj.email).subscribe({
        next: (userSession) => {
          this.authService.setCurrentUser(userSession);
          this.authService.redirectByRole(userSession.role);
        },
        error: (err) => {
          alert('Error de conexión con el servidor. Inténtelo nuevamente.');
        }
      });
    }
  }
}
