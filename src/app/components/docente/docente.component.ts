import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-docente',
  templateUrl: './docente.component.html',
  styles: []
})
export class DocenteComponent implements OnInit {
  user: User | null = null;
  
  // Incident Form inputs
  incLab = '';
  incPc = '';
  incDesc = '';

  // Software Form inputs
  softLab = '';
  softName = '';
  softObs = '';

  // Alerts
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';

  // UI Toggles
  isSidebarToggled = false;
  isUserDropdownOpen = false;

  constructor(
    private authService: AuthService,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    if (this.authService.checkAuth('docente')) {
      this.user = this.authService.getCurrentUser();
    }
  }

  onSubmitIncident(): void {
    if (!this.user) return;
    this.ticketService.createTicket(
      'Incidente',
      this.incLab,
      this.incPc,
      this.incDesc,
      this.user.email
    ).subscribe({
      next: () => {
        this.showAlert(
          'success',
          '¡Incidente reportado exitosamente! Ha sido guardado en la cola del Jefe de Soporte.'
        );
        // Reset Form
        this.incLab = '';
        this.incPc = '';
        this.incDesc = '';
      },
      error: () => {
        this.showAlert('danger', 'Hubo un error al intentar reportar el incidente.');
      }
    });
  }

  onSubmitSoftware(): void {
    if (!this.user) return;
    const description = `Instalación de software: ${this.softName}. Observaciones: ${this.softObs || 'Ninguna'}`;
    this.ticketService.createTicket(
      'Software',
      this.softLab,
      'Todas las PCs',
      description,
      this.user.email
    ).subscribe({
      next: () => {
        this.showAlert(
          'success',
          '¡Solicitud de instalación de software enviada con éxito! Registrada en el sistema.'
        );
        // Reset Form
        this.softLab = '';
        this.softName = '';
        this.softObs = '';
      },
      error: () => {
        this.showAlert('danger', 'Hubo un error al intentar enviar la solicitud.');
      }
    });
  }

  showAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeAlert(): void {
    this.alertMessage = null;
  }

  toggleSidebar(): void {
    this.isSidebarToggled = !this.isSidebarToggled;
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}
