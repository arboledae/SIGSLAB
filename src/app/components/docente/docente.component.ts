import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TicketService, AppNotification } from '../../services/ticket.service';
import { Ticket, Message } from '../../models/ticket.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-docente',
  templateUrl: './docente.component.html',
  styles: []
})
export class DocenteComponent implements OnInit, OnDestroy {
  user: User | null = null;
  activeTab: 'inicio' | 'registrar-incidente' | 'consultar-incidentes' | 'solicitar-instalacion' | 'solicitar-apertura' | 'consultar-solicitudes' | 'chats' | 'perfil' = 'inicio';

  // Incident Form inputs
  tipoAmbiente: 'Laboratorio' | 'Aula' = 'Laboratorio';
  incLab = 'Laboratorio 101 (Cómputo)';
  incCategory = 'Cómputo';
  incCategoryOther = '';
  incPc = 'Computadora';
  incPcOther = '';
  incDesc = '';
  incPriority: 'Alta' | 'Media' | 'Baja' = 'Alta';
  impideContinuidad = false;

  // Master lists
  LABS = ['Laboratorio 101 (Cómputo)', 'Laboratorio 102 (Sistemas)', 'Laboratorio 201 (Electrónica)', 'Laboratorio de Redes'];
  AULAS = ['Aula 101', 'Aula 102', 'Aula 103', 'Aula 201', 'Aula 202', 'Aula 203', 'Aula 301', 'Aula 302'];
  EQUIPOS = ['Computadora', 'Proyector', 'Impresora', 'Monitor', 'Mouse / Teclado', 'Ninguno / No aplica', 'Otro (Especificar)'];

  onAmbienteChange(): void {
    if (this.tipoAmbiente === 'Laboratorio') {
      this.incLab = this.LABS[0];
    } else {
      this.incLab = this.AULAS[0];
    }
  }

  onContinuidadChange(): void {
    if (this.impideContinuidad) {
      this.incPriority = 'Alta';
    }
  }

  getChatTickets(): Ticket[] {
    return this.myTickets.filter(t => t.status !== 'Finalizado');
  }

  // Software Form inputs
  softTipoAmbiente: 'Laboratorio' | 'Aula' = 'Laboratorio';
  softLab = 'Laboratorio 101 (Cómputo)';
  softName = '';
  softDateNeeded = '';
  softObs = '';

  onSoftAmbienteChange(): void {
    if (this.softTipoAmbiente === 'Laboratorio') {
      this.softLab = this.LABS[0];
    } else {
      this.softLab = this.AULAS[0];
    }
  }

  // Apertura Form inputs
  openLab = 'Laboratorio 101 (Cómputo)';
  openActivity = '';
  openDate = '';
  openTimeStr = '';

  // Search results
  myTickets: Ticket[] = [];
  incidentTickets: Ticket[] = [];
  requestTickets: Ticket[] = [];

  // Detail Modal / View
  selectedTicket: Ticket | null = null;
  isDetailOpen = false;

  // Active Chat
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
    if (this.authService.checkAuth('docente')) {
      this.user = this.authService.getCurrentUser();
      this.loadMyTickets();

      // Poll tickets every 3 seconds to get simulated chat replies in real-time
      this.chatPollInterval = setInterval(() => {
        this.silentReloadTickets();
      }, 3000);
    }
  }

  ngOnDestroy(): void {
    if (this.chatPollInterval) {
      clearInterval(this.chatPollInterval);
    }
  }

  loadMyTickets(): void {
    if (!this.user) return;
    this.loadNotifications();
    this.ticketService.getTicketsByCreator(this.user.email).subscribe({
      next: (tickets) => {
        this.myTickets = [...tickets].reverse(); // latest first
        this.incidentTickets = this.myTickets.filter(t => t.type === 'Incidente');
        this.requestTickets = this.myTickets.filter(t => t.type === 'Solicitud de instalación' || t.type === 'Solicitud de apertura');

        // Refresh selected chat ticket reference to update messages
        if (this.selectedChatTicket) {
          const updated = this.myTickets.find(t => t.id === this.selectedChatTicket?.id);
          if (updated) {
            this.selectedChatTicket = updated;
          }
        }
        if (this.selectedTicket) {
          const updated = this.myTickets.find(t => t.id === this.selectedTicket?.id);
          if (updated) {
            this.selectedTicket = updated;
          }
        }
      },
      error: () => {
        this.showAlert('danger', 'Error al cargar tus tickets del sistema.');
      }
    });
  }

  silentReloadTickets(): void {
    if (!this.user) return;
    this.loadNotifications();
    this.ticketService.getTicketsByCreator(this.user.email).subscribe({
      next: (tickets) => {
        this.myTickets = [...tickets].reverse();
        this.incidentTickets = this.myTickets.filter(t => t.type === 'Incidente');
        this.requestTickets = this.myTickets.filter(t => t.type === 'Solicitud de instalación' || t.type === 'Solicitud de apertura');

        if (this.selectedChatTicket) {
          const updated = this.myTickets.find(t => t.id === this.selectedChatTicket?.id);
          if (updated) {
            this.selectedChatTicket = updated;
          }
        }
        if (this.selectedTicket) {
          const updated = this.myTickets.find(t => t.id === this.selectedTicket?.id);
          if (updated) {
            this.selectedTicket = updated;
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

  switchTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
    this.closeAlert();
    this.loadMyTickets();
  }

  // --- ACTIONS ---

  onSubmitIncident(): void {
    if (!this.user) return;
    const finalCategory = this.incCategory === 'Otro' ? (this.incCategoryOther.trim() || 'Otro') : this.incCategory;
    const finalPc = this.incPc === 'Otro (Especificar)' ? (this.incPcOther.trim() || 'Otro') : this.incPc;
    const title = `${finalCategory} en ${this.incLab}`;
    const description = `Categoría: ${finalCategory}. Lugar: ${this.incLab}. Equipo: ${finalPc}. ¿Impide continuidad?: ${this.impideContinuidad ? 'SÍ' : 'NO'}. Descripción: ${this.incDesc}`;

    this.ticketService.createTicket(
      'Incidente',
      title,
      description,
      this.incPriority,
      this.user.email,
      this.user.name,
      this.incLab,
      finalPc
    ).subscribe({
      next: (tkt) => {
        this.showAlert('success', `¡Incidente reportado exitosamente! Código del ticket generado: ${tkt.id}`);
        // Reset Form
        this.incLab = this.tipoAmbiente === 'Laboratorio' ? this.LABS[0] : this.AULAS[0];
        this.incCategory = 'Cómputo';
        this.incCategoryOther = '';
        this.incPc = 'Computadora';
        this.incPcOther = '';
        this.impideContinuidad = false;
        this.incDesc = '';
        this.incPriority = 'Alta';

        // Redirigir al detalle del ticket
        this.openTicketDetail(tkt);
      },
      error: () => {
        this.showAlert('danger', 'Hubo un error al intentar reportar el incidente.');
      }
    });
  }

  onSubmitSoftware(): void {
    if (!this.user) return;
    const title = `Instalación de ${this.softName} en ${this.softLab}`;
    const description = `Se solicita la instalación del software ${this.softName} en ${this.softLab}. Fecha requerida: ${this.softDateNeeded}. Observaciones: ${this.softObs || 'Ninguna'}`;

    this.ticketService.createTicket(
      'Solicitud de instalación',
      title,
      description,
      'Media', // Default Priority
      this.user.email,
      this.user.name,
      this.softLab,
      'Todas las PCs'
    ).subscribe({
      next: (tkt) => {
        this.showAlert('success', `¡Solicitud de software enviada con éxito! Código del ticket: ${tkt.id}`);
        this.softLab = this.softTipoAmbiente === 'Laboratorio' ? this.LABS[0] : this.AULAS[0];
        this.softName = '';
        this.softDateNeeded = '';
        this.softObs = '';

        // Redirigir al detalle del ticket
        this.openTicketDetail(tkt);
      },
      error: () => {
        this.showAlert('danger', 'Hubo un error al intentar enviar la solicitud.');
      }
    });
  }

  onSubmitApertura(): void {
    if (!this.user) return;
    const title = `Apertura de ${this.openLab}`;
    const description = `Se solicita la apertura del laboratorio ${this.openLab} para la actividad/motivo: "${this.openActivity}". Fecha: ${this.openDate}, Hora: ${this.openTimeStr}.`;

    this.ticketService.createTicket(
      'Solicitud de apertura',
      title,
      description,
      'Baja', // Default Priority
      this.user.email,
      this.user.name,
      this.openLab,
      'N/A'
    ).subscribe({
      next: (tkt) => {
        this.showAlert('success', `¡Solicitud de apertura enviada con éxito! Código del ticket: ${tkt.id}`);
        this.openLab = 'Laboratorio 101 (Cómputo)';
        this.openActivity = '';
        this.openDate = '';
        this.openTimeStr = '';

        // Redirigir al detalle del ticket
        this.openTicketDetail(tkt);
      },
      error: () => {
        this.showAlert('danger', 'Hubo un error al intentar registrar la solicitud de apertura.');
      }
    });
  }

  openTicketDetail(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.isDetailOpen = true;
  }

  closeTicketDetail(): void {
    this.selectedTicket = null;
    this.isDetailOpen = false;
    this.loadMyTickets();
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
      next: (updatedTkt) => {
        this.selectedChatTicket = updatedTkt;
        this.chatMessageText = '';
        this.loadMyTickets();
      }
    });
  }

  getLastChatMessage(ticket: Ticket): Message | null {
    if (ticket.chat.length === 0) return null;
    return ticket.chat[ticket.chat.length - 1];
  }

  // --- STATS HELPER ---

  getStats() {
    return {
      total: this.myTickets.length,
      pendiente: this.myTickets.filter(t => t.status === 'Pendiente').length,
      proceso: this.myTickets.filter(t => t.status === 'En proceso' || t.status === 'Asignado').length,
      finalizado: this.myTickets.filter(t => t.status === 'Finalizado').length
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
