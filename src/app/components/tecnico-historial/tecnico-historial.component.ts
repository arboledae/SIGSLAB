import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-tecnico-historial',
  templateUrl: './tecnico-historial.component.html',
  styles: []
})
export class TecnicoHistorialComponent implements OnInit {
  user: User | null = null;
  historyTickets: Ticket[] = [];

  isSidebarToggled = false;
  isUserDropdownOpen = false;

  constructor(
    private authService: AuthService,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    if (this.authService.checkAuth('tecnico')) {
      this.user = this.authService.getCurrentUser();
      this.loadHistory();
    }
  }

  loadHistory(): void {
    if (!this.user) return;
    this.ticketService.getTicketsByAssigned(this.user.name).subscribe({
      next: (tickets) => {
        // Filter tickets assigned to this technician which are 'Asignado' or 'Finalizado'
        this.historyTickets = tickets
          .filter(t => t.status === 'Asignado' || t.status === 'Finalizado')
          .reverse();
      },
      error: () => {
        console.error('Error al cargar el historial técnico.');
      }
    });
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
