import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TicketService, AppNotification } from '../../services/ticket.service';
import { Ticket, Message } from '../../models/ticket.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-tecnico',
  templateUrl: './tecnico.component.html',
  styles: []
})
export class TecnicoComponent implements OnInit, OnDestroy {
  user: User | null = null;
  activeTab: 'bandeja' | 'atencion' | 'historial' | 'chats' | 'perfil' = 'bandeja';

  // Ticket Lists
  allMyTickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  closedTickets: Ticket[] = [];

  // Filter inputs
  filterStatus = '';
  filterPriority = '';
  filterType = '';
  searchQuery = '';

  // Attention Flow
  selectedTicketForAttention: Ticket | null = null;
  diagnostic = '';
  correctiveAction = '';
  observations = '';

  // View Info modal
  selectedTicketForInfo: Ticket | null = null;
  isInfoModalOpen = false;

  // Chats
  selectedChatTicket: Ticket | null = null;
  chatMessageText = '';
  private chatPollInterval: any;

  // Alerts
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';

  // UI Toggles
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
      this.loadInbox();

      // Poll chats and tickets every 3 seconds for updates
      this.chatPollInterval = setInterval(() => {
        this.silentReloadInbox();
      }, 3000);
    }
  }

  ngOnDestroy(): void {
    if (this.chatPollInterval) {
      clearInterval(this.chatPollInterval);
    }
  }

  loadInbox(): void {
    if (!this.user) return;
    this.loadNotifications();
    this.ticketService.getTicketsByAssigned(this.user.name).subscribe({
      next: (tickets) => {
        this.allMyTickets = tickets;
        this.applyFilters();

        // Refresh references
        if (this.selectedTicketForAttention) {
          const updated = this.allMyTickets.find(t => t.id === this.selectedTicketForAttention?.id);
          if (updated) {
            this.selectedTicketForAttention = updated;
          }
        }
        if (this.selectedChatTicket) {
          const updated = this.allMyTickets.find(t => t.id === this.selectedChatTicket?.id);
          if (updated) {
            this.selectedChatTicket = updated;
          }
        }
        if (this.selectedTicketForInfo) {
          const updated = this.allMyTickets.find(t => t.id === this.selectedTicketForInfo?.id);
          if (updated) {
            this.selectedTicketForInfo = updated;
          }
        }
      },
      error: () => {
        this.showAlert('danger', 'Error al cargar tu bandeja de tickets.');
      }
    });
  }

  silentReloadInbox(): void {
    if (!this.user) return;
    this.loadNotifications();
    this.ticketService.getTicketsByAssigned(this.user.name).subscribe({
      next: (tickets) => {
        this.allMyTickets = tickets;
        this.closedTickets = this.allMyTickets.filter(t => t.status === 'Finalizado').reverse();
        
        // Don't override user filtered lists unless they sync
        if (this.selectedTicketForAttention) {
          const updated = this.allMyTickets.find(t => t.id === this.selectedTicketForAttention?.id);
          if (updated) {
            this.selectedTicketForAttention = updated;
          }
        }
        if (this.selectedChatTicket) {
          const updated = this.allMyTickets.find(t => t.id === this.selectedChatTicket?.id);
          if (updated) {
            this.selectedChatTicket = updated;
          }
        }
        if (this.selectedTicketForInfo) {
          const updated = this.allMyTickets.find(t => t.id === this.selectedTicketForInfo?.id);
          if (updated) {
            this.selectedTicketForInfo = updated;
          }
        }
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

  applyFilters(): void {
    let result = [...this.allMyTickets];

    // Filter active tickets (exclude closed in work inbox, or filter by active status)
    if (this.filterStatus) {
      result = result.filter(t => t.status === this.filterStatus);
    } else {
      result = result.filter(t => t.status !== 'Finalizado'); // default to pending/in process/assigned
    }

    if (this.filterPriority) {
      result = result.filter(t => t.priority === this.filterPriority);
    }

    if (this.filterType) {
      result = result.filter(t => t.type === this.filterType);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(t => 
        t.id.toLowerCase().includes(q) || 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) || 
        t.creator.toLowerCase().includes(q) ||
        t.lab?.toLowerCase().includes(q)
      );
    }

    this.filteredTickets = result.reverse(); // latest first
    this.closedTickets = this.allMyTickets.filter(t => t.status === 'Finalizado').reverse();
  }

  resetFilters(): void {
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterType = '';
    this.searchQuery = '';
    this.applyFilters();
  }

  switchTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
    this.closeAlert();
    this.loadInbox();
  }

  // --- ATTENTION FLOW ---

  selectTicketToAttend(ticket: Ticket): void {
    this.selectedTicketForAttention = ticket;
    this.diagnostic = ticket.diagnostic || '';
    this.correctiveAction = ticket.correctiveAction || '';
    this.observations = ticket.observations || '';
    this.activeTab = 'atencion';
  }

  startAttention(): void {
    if (!this.selectedTicketForAttention || !this.user) return;
    this.ticketService.startAttention(this.selectedTicketForAttention.id, this.user.email).subscribe({
      next: (updated) => {
        this.selectedTicketForAttention = updated;
        this.loadInbox();
        this.showAlert('success', `Atención iniciada para el ticket ${updated.id}.`);
      },
      error: () => {
        this.showAlert('danger', 'Error al iniciar la atención del ticket.');
      }
    });
  }

  saveProgress(): void {
    if (!this.selectedTicketForAttention || !this.user) return;
    this.ticketService.saveAttentionProgress(
      this.selectedTicketForAttention.id,
      this.diagnostic,
      this.correctiveAction,
      this.observations,
      this.user.email
    ).subscribe({
      next: (updated) => {
        this.selectedTicketForAttention = updated;
        this.loadInbox();
        this.showAlert('success', `Avances del ticket ${updated.id} guardados correctamente.`);
      },
      error: () => {
        this.showAlert('danger', 'Error al guardar los avances del ticket.');
      }
    });
  }

  finalizeAttention(): void {
    if (!this.selectedTicketForAttention || !this.user) return;
    if (!this.diagnostic.trim() || !this.correctiveAction.trim()) {
      this.showAlert('danger', 'Debe ingresar el Diagnóstico y las Acciones Realizadas antes de finalizar.');
      return;
    }

    this.ticketService.closeTicketFull(
      this.selectedTicketForAttention.id,
      this.diagnostic,
      this.correctiveAction,
      this.observations,
      this.user.email
    ).subscribe({
      next: (updated) => {
        this.selectedTicketForAttention = null;
        this.loadInbox();
        this.activeTab = 'historial';
        this.showAlert('success', `El ticket ${updated.id} ha sido resuelto y cerrado como Finalizado.`);
      },
      error: () => {
        this.showAlert('danger', 'Error al intentar finalizar la atención del ticket.');
      }
    });
  }

  // --- DETAIL INFORMATION MODAL ---

  showTicketDetail(ticket: Ticket): void {
    this.selectedTicketForInfo = ticket;
    this.isInfoModalOpen = true;
  }

  closeInfoModal(): void {
    this.selectedTicketForInfo = null;
    this.isInfoModalOpen = false;
  }

  // --- CHAT SYSTEM ---

  openChatForTicket(ticket: Ticket): void {
    this.selectedChatTicket = ticket;
    this.chatMessageText = '';
    this.activeTab = 'chats';
  }

  sendChatMessage(): void {
    if (!this.selectedChatTicket || !this.user || !this.chatMessageText.trim()) return;

    this.ticketService.sendChatMessage(
      this.selectedChatTicket.id,
      this.user.email,
      this.user.name,
      this.chatMessageText.trim()
    ).subscribe({
      next: (updated) => {
        this.selectedChatTicket = updated;
        this.chatMessageText = '';
        this.loadInbox();
      }
    });
  }

  getLastChatMessage(ticket: Ticket): Message | null {
    if (ticket.chat.length === 0) return null;
    return ticket.chat[ticket.chat.length - 1];
  }

  // --- METRICS ---

  getStats() {
    return {
      assigned: this.allMyTickets.filter(t => t.status === 'Asignado').length,
      inProcess: this.allMyTickets.filter(t => t.status === 'En proceso').length,
      closed: this.allMyTickets.filter(t => t.status === 'Finalizado').length
    };
  }

  // --- UI METRICS ---

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
