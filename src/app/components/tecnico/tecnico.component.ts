import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-tecnico',
  templateUrl: './tecnico.component.html',
  styles: []
})
export class TecnicoComponent implements OnInit {
  user: User | null = null;
  activeTickets: Ticket[] = [];

  // Info Modal
  isInfoModalOpen = false;
  selectedTicketForInfo: Ticket | null = null;

  // Close Ticket Modal
  isCloseModalOpen = false;
  ticketIdToClose = '';
  correctiveAction = '';

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
    if (this.authService.checkAuth('tecnico')) {
      this.user = this.authService.getCurrentUser();
      this.loadInbox();
    }
  }

  loadInbox(): void {
    if (!this.user) return;
    this.ticketService.getTicketsByAssigned(this.user.name).subscribe({
      next: (tickets) => {
        // Filter active tickets assigned to this technician
        this.activeTickets = tickets.filter(t => t.status === 'Asignado');
      },
      error: () => {
        console.error('Error al cargar la bandeja de tickets asignados.');
      }
    });
  }

  showTicketDetail(ticket: Ticket): void {
    this.selectedTicketForInfo = ticket;
    this.isInfoModalOpen = true;
  }

  closeInfoModal(): void {
    this.isInfoModalOpen = false;
    this.selectedTicketForInfo = null;
  }

  openCloseModal(ticketId: string): void {
    this.ticketIdToClose = ticketId;
    this.correctiveAction = '';
    this.isCloseModalOpen = true;
  }

  closeCloseModal(): void {
    this.isCloseModalOpen = false;
    this.ticketIdToClose = '';
    this.correctiveAction = '';
  }

  confirmClosure(event: Event): void {
    event.preventDefault();
    if (!this.ticketIdToClose) return;

    this.ticketService.closeTicket(
      this.ticketIdToClose,
      this.correctiveAction
    ).subscribe({
      next: () => {
        this.showAlert(
          'success',
          `El ticket <strong>${this.ticketIdToClose}</strong> ha sido cerrado correctamente con estado <strong>Finalizado</strong>.`
        );
        this.loadInbox();
        this.closeCloseModal();
      },
      error: () => {
        this.showAlert('danger', 'Ocurrió un error al procesar el cierre del ticket.');
        this.closeCloseModal();
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
