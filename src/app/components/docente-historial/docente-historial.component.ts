import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-docente-historial',
  templateUrl: './docente-historial.component.html',
  styles: []
})
export class DocenteHistorialComponent implements OnInit {
  user: User | null = null;
  historyTickets: Ticket[] = [];

  isSidebarToggled = false;
  isUserDropdownOpen = false;

  constructor(
    private authService: AuthService,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    if (this.authService.checkAuth('docente')) {
      this.user = this.authService.getCurrentUser();
      this.loadHistory();
    }
  }

  loadHistory(): void {
    if (!this.user) return;
    this.ticketService.getTicketsByCreator(this.user.email).subscribe({
      next: (tickets) => {
        // Reverse to show latest first
        this.historyTickets = [...tickets].reverse();
      },
      error: () => {
        console.error('Error al cargar el historial de tickets.');
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
