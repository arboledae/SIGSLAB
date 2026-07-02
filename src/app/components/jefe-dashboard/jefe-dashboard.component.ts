import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TicketService, GlobalAudit, AppNotification } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';
import { User } from '../../models/user.model';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-jefe-dashboard',
  templateUrl: './jefe-dashboard.component.html',
  styles: []
})
export class JefeDashboardComponent implements OnInit {
  user: User | null = null;
  activeTab: 'dashboard' | 'usuarios' | 'tickets' | 'laboratorios' | 'historial' = 'dashboard';

  // Ticket Matriz
  allTickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];

  // Ticket Filters
  filterStatus = '';
  filterPriority = '';
  filterType = '';
  filterTecnico = '';
  searchQuery = '';

  // Technician / Users management
  tecnicos: User[] = [];
  allUsers: User[] = [];
  newUserEmail = '';
  newUserName = '';
  newUserRole: 'docente' | 'jefe-soporte' | 'tecnico' = 'tecnico';

  // Assignment / Reassignment Modal
  isAssignModalOpen = false;
  selectedTicketIdForAssign: string | null = null;
  selectedTecnicoName = '';
  isReassignment = false;

  // Lab Reservations
  reservations: Reservation[] = [];
  WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Reservas Agrupadas por Día de la Semana
  groupedReservations: { [day: string]: Reservation[] } = {};

  // Programar Reserva Modal
  isReserveModalOpen = false;
  resLab = '';
  resReason = '';
  resDays: { [day: string]: boolean } = {};
  resStartTime = '';
  resEndTime = '';
  resRepeatWeekly = false;
  resRepeatUntil = '';

  // Detailed view of reservation
  selectedReservation: Reservation | null = null;
  isResInfoOpen = false;

  // Global History Audit Log
  globalLogs: GlobalAudit[] = [];

  // Details Modal
  selectedTicketForInfo: Ticket | null = null;
  isInfoModalOpen = false;

  // Alerts
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';

  // UI Toggles
  isSidebarToggled = false;
  isUserDropdownOpen = false;
  isNotificationDropdownOpen = false;
  notifications: AppNotification[] = [];

  selectedScheduleLab: string = '';
  currentWeekStart: Date = new Date(2026, 5, 29); // Lunes, 29 de Junio de 2026
  HOURS_INTERVALS = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
    '18:00 - 19:00',
    '19:00 - 20:00',
    '20:00 - 21:00',
    '21:00 - 22:00'
  ];

  constructor(
    private authService: AuthService,
    public ticketService: TicketService
  ) {}

  ngOnInit(): void {
    if (this.authService.checkAuth('jefe-soporte')) {
      this.user = this.authService.getCurrentUser();
      
      // Inicializar usuarios si no existen
      this.loadUsers();
      this.loadDashboardData();
      this.selectedScheduleLab = this.ticketService.LABORATORIOS[0];
    }
  }

  loadDashboardData(): void {
    this.loadNotifications();
    // 1. Cargar tickets
    this.ticketService.getTickets().subscribe({
      next: (tickets) => {
        this.allTickets = tickets;
        this.applyFilters();
      }
    });

    // 2. Cargar técnicos
    this.ticketService.getTechnicians().subscribe({
      next: (techs) => {
        this.tecnicos = techs;
        if (this.tecnicos.length > 0 && !this.selectedTecnicoName) {
          this.selectedTecnicoName = this.tecnicos[0].name;
        }
      }
    });

    // 3. Cargar Reservas y agrupar por día
    this.ticketService.getReservations().subscribe({
      next: (resList) => {
        this.reservations = resList;
        this.groupReservationsByDay();
      }
    });

    // 4. Cargar Historial Global
    this.ticketService.getGlobalHistory().subscribe({
      next: (logs) => {
        this.globalLogs = logs;
      }
    });
  }

  switchTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
    this.closeAlert();
    this.loadDashboardData();
  }

  // --- FILTER SYSTEM ---

  applyFilters(): void {
    let result = [...this.allTickets];

    if (this.filterStatus) {
      result = result.filter(t => t.status === this.filterStatus);
    }
    if (this.filterPriority) {
      result = result.filter(t => t.priority === this.filterPriority);
    }
    if (this.filterType) {
      result = result.filter(t => t.type === this.filterType);
    }
    if (this.filterTecnico) {
      result = result.filter(t => t.assignedTo === this.filterTecnico);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(t => 
        t.id.toLowerCase().includes(q) || 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) || 
        t.creator.toLowerCase().includes(q) ||
        (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
      );
    }

    this.filteredTickets = result.reverse(); // latest first
  }

  resetFilters(): void {
    this.filterStatus = '';
    this.filterPriority = '';
    this.filterType = '';
    this.filterTecnico = '';
    this.searchQuery = '';
    this.applyFilters();
  }

  // --- USER MANAGEMENT ---

  loadUsers(): void {
    const data = localStorage.getItem('sigslab_users');
    const defaultUsers: User[] = [
      { email: 'docente@sigslab.com', name: 'Dr. Héctor Flores', role: 'docente' },
      { email: 'jefe@sigslab.com', name: 'Ing. Laura Ruíz', role: 'jefe-soporte' },
      { email: 'juan.perez@sigslab.com', name: 'Juan Pérez (Bolsista)', role: 'tecnico' },
      { email: 'maria.gomez@sigslab.com', name: 'María Gómez (Técnico)', role: 'tecnico' },
      { email: 'carlos.lopez@sigslab.com', name: 'Carlos López (Bolsista)', role: 'tecnico' }
    ];
    if (!data) {
      localStorage.setItem('sigslab_users', JSON.stringify(defaultUsers));
      this.allUsers = defaultUsers;
    } else {
      try {
        this.allUsers = JSON.parse(data) as User[];
      } catch {
        this.allUsers = defaultUsers;
      }
    }
  }

  saveUsers(): void {
    localStorage.setItem('sigslab_users', JSON.stringify(this.allUsers));
    this.loadUsers();
    this.loadDashboardData();
  }

  addUser(): void {
    if (!this.newUserEmail.trim() || !this.newUserName.trim()) return;
    
    // Check duplication
    const exists = this.allUsers.some(u => u.email.toLowerCase() === this.newUserEmail.trim().toLowerCase());
    if (exists) {
      this.showAlert('danger', 'Ya existe un usuario registrado con este correo electrónico.');
      return;
    }

    const newUser: User = {
      email: this.newUserEmail.trim().toLowerCase(),
      name: this.newUserName.trim(),
      role: this.newUserRole
    };

    this.allUsers.push(newUser);
    this.saveUsers();

    // Reset Form
    this.newUserEmail = '';
    this.newUserName = '';
    this.newUserRole = 'tecnico';
    this.showAlert('success', 'Usuario registrado con éxito en el sistema mockup.');
  }

  deleteUser(email: string): void {
    if (email === 'jefe@sigslab.com') {
      this.showAlert('danger', 'No puedes eliminar la cuenta de administrador principal.');
      return;
    }
    this.allUsers = this.allUsers.filter(u => u.email !== email);
    this.saveUsers();
    this.showAlert('success', 'Usuario eliminado correctamente.');
  }

  // --- ASSIGN / REASSIGN FLOW ---

  openAssignModal(ticketId: string, reassign = false): void {
    this.selectedTicketIdForAssign = ticketId;
    this.isReassignment = reassign;
    this.isAssignModalOpen = true;

    const tkt = this.allTickets.find(t => t.id === ticketId);
    if (tkt && tkt.assignedTo) {
      this.selectedTecnicoName = tkt.assignedTo;
    } else if (this.tecnicos.length > 0) {
      this.selectedTecnicoName = this.tecnicos[0].name;
    }
  }

  closeAssignModal(): void {
    this.isAssignModalOpen = false;
    this.selectedTicketIdForAssign = null;
    this.isReassignment = false;
  }

  confirmAssignment(event: Event): void {
    event.preventDefault();
    if (!this.selectedTicketIdForAssign || !this.selectedTecnicoName) return;

    const action = this.isReassignment 
      ? this.ticketService.reassignTicket(this.selectedTicketIdForAssign, this.selectedTecnicoName)
      : this.ticketService.assignTicket(this.selectedTicketIdForAssign, this.selectedTecnicoName);

    action.subscribe({
      next: () => {
        this.loadDashboardData();
        this.closeAssignModal();
        this.showAlert('success', `El ticket ${this.selectedTicketIdForAssign} fue asignado/reasignado con éxito a ${this.selectedTecnicoName}.`);
      },
      error: (err) => {
        if (err.message === 'limit_reached') {
          this.showAlert('danger', `No se puede asignar. El técnico bolsista ${this.selectedTecnicoName} ya tiene asignado el límite máximo de 12 tickets activos.`);
        } else {
          this.showAlert('danger', 'Ocurrió un error inesperado al realizar la asignación.');
        }
        this.closeAssignModal();
      }
    });
  }

  // --- RESERVATION SCHEDULER ---

  groupReservationsByDay(): void {
    this.WEEK_DAYS.forEach(day => {
      this.groupedReservations[day] = [];
    });

    this.reservations.forEach(res => {
      res.days.forEach(day => {
        if (this.groupedReservations[day]) {
          this.groupedReservations[day].push(res);
        }
      });
    });

    // Sort reservations by startTime
    this.WEEK_DAYS.forEach(day => {
      this.groupedReservations[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
  }

  openReserveModal(): void {
    this.resLab = this.ticketService.LABORATORIOS[0];
    this.resReason = '';
    this.WEEK_DAYS.forEach(day => {
      this.resDays[day] = false;
    });
    this.resStartTime = '';
    this.resEndTime = '';
    this.resRepeatWeekly = false;
    this.resRepeatUntil = '';
    this.isReserveModalOpen = true;
  }

  closeReserveModal(): void {
    this.isReserveModalOpen = false;
  }

  saveReservation(event: Event): void {
    event.preventDefault();
    if (!this.resStartTime || !this.resEndTime || !this.resReason.trim()) return;

    // Get selected days list
    const selectedDays = Object.keys(this.resDays).filter(day => this.resDays[day]);
    if (selectedDays.length === 0) {
      this.showAlert('danger', 'Debe seleccionar al menos un día de la semana para la reserva.');
      return;
    }

    const payload = {
      lab: this.resLab,
      reason: this.resReason.trim(),
      teacher: this.user?.name || 'Administración de Soporte',
      days: selectedDays,
      startTime: this.resStartTime,
      endTime: this.resEndTime,
      repeatWeekly: this.resRepeatWeekly,
      repeatUntil: this.resRepeatWeekly ? this.resRepeatUntil : undefined
    };

    this.ticketService.addReservation(payload).subscribe({
      next: () => {
        this.loadDashboardData();
        this.closeReserveModal();
        this.showAlert('success', 'La programación de laboratorio se ha registrado con éxito y no presenta conflictos.');
      },
      error: (err) => {
        // Error contains conflict message, shown as danger alert
        this.showAlert('danger', err.message);
      }
    });
  }

  showReservationInfo(res: Reservation): void {
    this.selectedReservation = res;
    this.isResInfoOpen = true;
  }

  closeReservationInfo(): void {
    this.selectedReservation = null;
    this.isResInfoOpen = false;
  }

  // --- TICKET DETAILED INFO MODAL ---

  showTicketDetail(ticket: Ticket): void {
    this.selectedTicketForInfo = ticket;
    this.isInfoModalOpen = true;
  }

  viewTicketById(ticketId: string): void {
    const t = this.allTickets.find(x => x.id === ticketId);
    if (t) {
      this.showTicketDetail(t);
    }
  }

  closeInfoModal(): void {
    this.selectedTicketForInfo = null;
    this.isInfoModalOpen = false;
  }

  // --- STATS SYSTEM ---

  getStats() {
    return {
      total: this.allTickets.length,
      pendiente: this.allTickets.filter(t => t.status === 'Pendiente').length,
      asignado: this.allTickets.filter(t => t.status === 'Asignado').length,
      enProceso: this.allTickets.filter(t => t.status === 'En proceso').length,
      finalizado: this.allTickets.filter(t => t.status === 'Finalizado').length
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

  logout(): void {
    this.authService.logout();
  }

  parseTimeToMinutes(time: string): number {
    if (!time) return 0;
    const [hh, mm] = time.split(':').map(Number);
    return hh * 60 + mm;
  }

  getReservationForSlot(dayName: string, hourSlot: string): Reservation | null {
    const lab = this.selectedScheduleLab;
    const [slotStart, slotEnd] = hourSlot.split(' - ');
    const slotStartMin = this.parseTimeToMinutes(slotStart);
    const slotEndMin = this.parseTimeToMinutes(slotEnd);

    const dayRes = this.groupedReservations[dayName] || [];
    const found = dayRes.find(r => {
      if (r.lab !== lab) return false;
      
      const rStartMin = this.parseTimeToMinutes(r.startTime);
      const rEndMin = this.parseTimeToMinutes(r.endTime);
      if (!(slotStartMin < rEndMin && slotEndMin > rStartMin)) return false;

      // Date boundaries check (repeatUntil)
      if (r.repeatUntil) {
        const slotDate = this.getDateOfDay(dayName);
        const untilDate = new Date(r.repeatUntil + 'T00:00:00');
        if (slotDate > untilDate) return false;
      }

      return true;
    });

    return found || null;
  }

  getWeekLabel(): string {
    const start = this.currentWeekStart;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const startDay = start.getDate();
    const startMonth = months[start.getMonth()];
    const startYear = start.getFullYear();

    const endDay = end.getDate();
    const endMonth = months[end.getMonth()];
    const endYear = end.getFullYear();

    if (startYear === endYear) {
      if (start.getMonth() === end.getMonth()) {
        return `${startDay} - ${endDay} de ${startMonth} ${startYear}`;
      } else {
        return `${startDay} de ${startMonth} - ${endDay} de ${endMonth} ${startYear}`;
      }
    } else {
      return `${startDay} de ${startMonth} ${startYear} - ${endDay} de ${endMonth} ${endYear}`;
    }
  }

  nextWeek(): void {
    const next = new Date(this.currentWeekStart);
    next.setDate(next.getDate() + 7);
    this.currentWeekStart = next;
  }

  prevWeek(): void {
    const prev = new Date(this.currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    this.currentWeekStart = prev;
  }

  resetToToday(): void {
    this.currentWeekStart = new Date(2026, 5, 29); // Lunes, 29 de Junio de 2026
  }

  getDateOfDay(dayName: string): Date {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const idx = days.indexOf(dayName);
    const d = new Date(this.currentWeekStart);
    d.setDate(d.getDate() + idx);
    return d;
  }

  getWeekDayHeader(dayName: string): string {
    const d = this.getDateOfDay(dayName);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dayName.substring(0, 3)} ${d.getDate()}/${monthNames[d.getMonth()]}`;
  }
}
