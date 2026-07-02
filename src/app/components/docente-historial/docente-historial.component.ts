import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TicketService, AppNotification } from '../../services/ticket.service';
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
  isNotificationDropdownOpen = false;
  notifications: AppNotification[] = [];

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
    this.loadNotifications();
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
