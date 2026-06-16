import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-jefe-dashboard',
  templateUrl: './jefe-dashboard.component.html',
  styles: []
})
export class JefeDashboardComponent implements OnInit {
  user: User | null = null;
  tickets: Ticket[] = [];
  tecnicos: string[] = [];

  // Assignment Modal
  isAssignModalOpen = false;
  selectedTicketId: string | null = null;
  selectedTecnico = '';

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
    if (this.authService.checkAuth('jefe-soporte')) {
      this.user = this.authService.getCurrentUser();
      
      // Load technicians dynamically from DB
      this.ticketService.getTechnicians().subscribe({
        next: (users) => {
          this.tecnicos = users.map(u => u.name);
          if (this.tecnicos.length > 0) {
            this.selectedTecnico = this.tecnicos[0];
          }
        },
        error: () => {
          this.tecnicos = this.ticketService.TECNICOS;
          if (this.tecnicos.length > 0) {
            this.selectedTecnico = this.tecnicos[0];
          }
        }
      });

      this.loadDashboard();
    }
  }

  loadDashboard(): void {
    this.ticketService.getTickets().subscribe({
      next: (tickets) => {
        // Reverse to show latest first
        this.tickets = [...tickets].reverse();
      },
      error: () => {
        console.error('Error al cargar la matriz de tickets.');
      }
    });
  }

  openAssignModal(ticketId: string): void {
    this.selectedTicketId = ticketId;
    this.isAssignModalOpen = true;
  }

  closeAssignModal(): void {
    this.isAssignModalOpen = false;
    this.selectedTicketId = null;
  }

  confirmAssignment(event: Event): void {
    event.preventDefault();
    if (!this.selectedTicketId) return;

    this.ticketService.assignTicket(
      this.selectedTicketId,
      this.selectedTecnico
    ).subscribe({
      next: () => {
        this.showAlert(
          'success',
          `El ticket <strong>${this.selectedTicketId}</strong> ha sido asignado con éxito a <strong>${this.selectedTecnico}</strong> y su estado cambió a 'Asignado'.`
        );
        this.loadDashboard();
        this.closeAssignModal();
      },
      error: (err) => {
        const errMsg = err.error?.message || err.message;
        if (errMsg === 'limit_reached') {
          this.showAlert(
            'danger',
            `No se puede asignar el ticket. El bolsista <strong>${this.selectedTecnico}</strong> ya tiene asignado el límite máximo de 12 tickets activos.`
          );
        } else {
          this.showAlert('danger', 'Hubo un error al intentar asignar el ticket.');
        }
        this.closeAssignModal();
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
