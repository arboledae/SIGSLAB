import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TicketService, AppNotification } from '../../services/ticket.service';
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
  isNotificationDropdownOpen = false;
  notifications: AppNotification[] = [];

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
    this.loadNotifications();
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

  loadNotifications(): void {
    if (!this.user) return;
    this.ticketService.getNotifications(this.user.email).subscribe({
      next: (notifs) => {
        this.notifications = notifs;
      }
    });
  }

  clearNotifications(): void {
    if (!this.user) return;
    this.ticketService.markNotificationsAsRead(this.user.email).subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarToggled = !this.isSidebarToggled;
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  toggleNotificationDropdown(): void {
    this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
    if (this.isNotificationDropdownOpen) {
      this.clearNotifications();
    }
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  logout(): void {
    this.authService.logout();
  }
}
