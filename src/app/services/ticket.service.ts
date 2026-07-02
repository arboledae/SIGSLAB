import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Ticket, AuditLog, Message } from '../models/ticket.model';
import { User } from '../models/user.model';
import { Reservation } from '../models/reservation.model';
import { ToastService } from './toast.service';

export interface GlobalAudit {
  id: string;
  ticketId?: string;
  action: string;
  description: string;
  date: string;
  user: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'message' | 'ticket' | 'system';
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  readonly LABORATORIOS = [
    'Laboratorio 101 (Cómputo)',
    'Laboratorio 102 (Sistemas)',
    'Laboratorio 201 (Electrónica)',
    'Laboratorio de Redes'
  ];

  readonly TECNICOS = [
    'Juan Pérez (Bolsista)',
    'María Gómez (Técnico)',
    'Carlos López (Bolsista)'
  ];

  private readonly DEFAULT_TICKETS: Ticket[] = [
    {
      id: 'TKT-1001',
      type: 'Incidente',
      title: 'Pantalla defectuosa en PC-04',
      description: 'La pantalla parpadea constantemente y se apaga después de unos minutos de uso.',
      priority: 'Alta',
      status: 'Finalizado',
      createdDate: '2026-06-28 09:30',
      creator: 'docente@sigslab.com',
      creatorName: 'Dr. Héctor Flores',
      assignedTo: 'Juan Pérez (Bolsista)',
      assignedToEmail: 'juan.perez@sigslab.com',
      diagnostic: 'Cable HDMI en mal estado y conector suelto.',
      correctiveAction: 'Se cambió el cable HDMI defectuoso y se ajustó la resolución del monitor.',
      observations: 'Todo quedó operativo y probado.',
      endDate: '2026-06-28 11:15',
      lab: 'Laboratorio 101 (Cómputo)',
      pc: 'PC-04',
      history: [
        { action: 'Creación', description: 'Ticket creado automáticamente por el sistema.', date: '2026-06-28 09:30', user: 'docente@sigslab.com' },
        { action: 'Asignación', description: 'Asignado a Juan Pérez (Bolsista).', date: '2026-06-28 09:45', user: 'jefe@sigslab.com' },
        { action: 'Inicio de atención', description: 'Atención iniciada por Juan Pérez (Bolsista).', date: '2026-06-28 10:10', user: 'juan.perez@sigslab.com' },
        { action: 'Finalización', description: 'Atención finalizada con éxito.', date: '2026-06-28 11:15', user: 'juan.perez@sigslab.com' }
      ],
      chat: [
        { sender: 'docente@sigslab.com', senderName: 'Dr. Héctor Flores', content: 'Hola, la PC-04 sigue fallando. ¿Tienen repuestos?', timestamp: '2026-06-28 09:35' },
        { sender: 'juan.perez@sigslab.com', senderName: 'Juan Pérez (Bolsista)', content: 'Hola Héctor, ya voy en camino con un cable de repuesto.', timestamp: '2026-06-28 10:15' }
      ]
    },
    {
      id: 'TKT-1002',
      type: 'Solicitud de instalación',
      title: 'Instalación de Docker Desktop',
      description: 'Se requiere la instalación de Docker Desktop y VS Code para el curso de Arquitectura de Software.',
      priority: 'Media',
      status: 'Asignado',
      createdDate: '2026-06-30 14:15',
      creator: 'docente@sigslab.com',
      creatorName: 'Dr. Héctor Flores',
      assignedTo: 'María Gómez (Técnico)',
      assignedToEmail: 'maria.gomez@sigslab.com',
      lab: 'Laboratorio 102 (Sistemas)',
      pc: 'Todas las PCs',
      history: [
        { action: 'Creación', description: 'Ticket creado automáticamente por el sistema.', date: '2026-06-30 14:15', user: 'docente@sigslab.com' },
        { action: 'Asignación', description: 'Asignado a María Gómez (Técnico).', date: '2026-06-30 15:00', user: 'jefe@sigslab.com' }
      ],
      chat: []
    },
    {
      id: 'TKT-1003',
      type: 'Solicitud de apertura',
      title: 'Apertura de Laboratorio de Redes',
      description: 'Solicitud de apertura del laboratorio de Redes para práctica libre de cableado estructurado.',
      priority: 'Baja',
      status: 'Pendiente',
      createdDate: '2026-07-01 10:00',
      creator: 'docente@sigslab.com',
      creatorName: 'Dr. Héctor Flores',
      assignedTo: null,
      assignedToEmail: null,
      lab: 'Laboratorio de Redes',
      pc: 'N/A',
      history: [
        { action: 'Creación', description: 'Ticket creado automáticamente por el sistema.', date: '2026-07-01 10:00', user: 'docente@sigslab.com' }
      ],
      chat: []
    }
  ];

  private readonly DEFAULT_RESERVATIONS: Reservation[] = [
    {
      id: 'RES-5001',
      lab: 'Laboratorio 101 (Cómputo)',
      reason: 'Clase de Base de Datos I',
      teacher: 'Dr. Héctor Flores',
      days: ['Martes', 'Jueves'],
      startTime: '10:00',
      endTime: '12:00',
      repeatWeekly: true,
      repeatUntil: '2026-12-15',
      createdDate: '2026-06-20 08:00'
    },
    {
      id: 'RES-5002',
      lab: 'Laboratorio 102 (Sistemas)',
      reason: 'Taller de Programación Web',
      teacher: 'Ing. Laura Ruíz',
      days: ['Miércoles'],
      startTime: '14:00',
      endTime: '17:00',
      repeatWeekly: true,
      repeatUntil: '2026-12-15',
      createdDate: '2026-06-21 09:00'
    }
  ];

  private readonly DEFAULT_GLOBAL_HISTORY: GlobalAudit[] = [
    { id: 'AUD-9001', ticketId: 'TKT-1001', action: 'Creación', description: 'Ticket TKT-1001 creado automáticamente por el sistema.', date: '2026-06-28 09:30', user: 'docente@sigslab.com' },
    { id: 'AUD-9002', ticketId: 'TKT-1001', action: 'Asignación', description: 'Ticket TKT-1001 asignado a Juan Pérez (Bolsista).', date: '2026-06-28 09:45', user: 'jefe@sigslab.com' },
    { id: 'AUD-9003', ticketId: 'TKT-1001', action: 'Inicio de atención', description: 'Atención del ticket TKT-1001 iniciada por Juan Pérez (Bolsista).', date: '2026-06-28 10:10', user: 'juan.perez@sigslab.com' },
    { id: 'AUD-9004', ticketId: 'TKT-1001', action: 'Finalización', description: 'Atención del ticket TKT-1001 finalizada.', date: '2026-06-28 11:15', user: 'juan.perez@sigslab.com' },
    { id: 'AUD-9005', ticketId: 'TKT-1002', action: 'Creación', description: 'Ticket TKT-1002 creado automáticamente por el sistema.', date: '2026-06-30 14:15', user: 'docente@sigslab.com' },
    { id: 'AUD-9006', ticketId: 'TKT-1002', action: 'Asignación', description: 'Ticket TKT-1002 asignado a María Gómez (Técnico).', date: '2026-06-30 15:00', user: 'jefe@sigslab.com' },
    { id: 'AUD-9007', ticketId: 'TKT-1003', action: 'Creación', description: 'Ticket TKT-1003 creado automáticamente por el sistema.', date: '2026-07-01 10:00', user: 'docente@sigslab.com' }
  ];

  constructor(private toastService: ToastService) {}

  // --- LOCALSTORAGE PERSISTENCE HELPERS ---

  private getLocalTickets(): Ticket[] {
    const data = localStorage.getItem('sigslab_tickets');
    if (!data) {
      localStorage.setItem('sigslab_tickets', JSON.stringify(this.DEFAULT_TICKETS));
      return this.DEFAULT_TICKETS;
    }
    try {
      return JSON.parse(data) as Ticket[];
    } catch {
      return this.DEFAULT_TICKETS;
    }
  }

  private saveLocalTickets(tickets: Ticket[]): void {
    localStorage.setItem('sigslab_tickets', JSON.stringify(tickets));
  }

  private getLocalReservations(): Reservation[] {
    const data = localStorage.getItem('sigslab_reservations');
    if (!data) {
      localStorage.setItem('sigslab_reservations', JSON.stringify(this.DEFAULT_RESERVATIONS));
      return this.DEFAULT_RESERVATIONS;
    }
    try {
      return JSON.parse(data) as Reservation[];
    } catch {
      return this.DEFAULT_RESERVATIONS;
    }
  }

  private saveLocalReservations(reservations: Reservation[]): void {
    localStorage.setItem('sigslab_reservations', JSON.stringify(reservations));
  }

  private getLocalHistory(): GlobalAudit[] {
    const data = localStorage.getItem('sigslab_global_history');
    if (!data) {
      localStorage.setItem('sigslab_global_history', JSON.stringify(this.DEFAULT_GLOBAL_HISTORY));
      return this.DEFAULT_GLOBAL_HISTORY;
    }
    try {
      return JSON.parse(data) as GlobalAudit[];
    } catch {
      return this.DEFAULT_GLOBAL_HISTORY;
    }
  }

  private saveLocalHistory(history: GlobalAudit[]): void {
    localStorage.setItem('sigslab_global_history', JSON.stringify(history));
  }

  private addGlobalAudit(action: string, description: string, user: string, ticketId?: string): void {
    const history = this.getLocalHistory();
    const now = new Date();
    const dateStr = this.formatDate(now);
    const newEntry: GlobalAudit = {
      id: `AUD-${history.length + 9001}`,
      ticketId,
      action,
      description,
      date: dateStr,
      user
    };
    history.push(newEntry);
    this.saveLocalHistory(history);
  }

  private formatDate(now: Date): string {
    return (
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0') +
      ' ' +
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0')
    );
  }

  // --- TICKET METHODS ---

  getTickets(): Observable<Ticket[]> {
    return of(this.getLocalTickets());
  }

  getTicketsByCreator(email: string): Observable<Ticket[]> {
    return of(this.getLocalTickets().filter(t => t.creator === email));
  }

  getTicketsByAssigned(name: string): Observable<Ticket[]> {
    return of(this.getLocalTickets().filter(t => t.assignedTo === name));
  }

  getTechnicians(): Observable<User[]> {
    const technicians: User[] = [
      { email: 'juan.perez@sigslab.com', name: 'Juan Pérez (Bolsista)', role: 'tecnico' },
      { email: 'maria.gomez@sigslab.com', name: 'María Gómez (Técnico)', role: 'tecnico' },
      { email: 'carlos.lopez@sigslab.com', name: 'Carlos López (Bolsista)', role: 'tecnico' }
    ];
    return of(technicians);
  }

  createTicket(
    type: 'Incidente' | 'Solicitud de instalación' | 'Solicitud de apertura',
    title: string,
    description: string,
    priority: 'Alta' | 'Media' | 'Baja',
    creator: string,
    creatorName: string,
    lab?: string,
    pc?: string
  ): Observable<Ticket> {
    const now = new Date();
    const dateStr = this.formatDate(now);
    const tickets = this.getLocalTickets();

    const nextNum = tickets.reduce((max, t) => {
      const match = t.id.match(/TKT-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1000) + 1;

    const tktId = `TKT-${nextNum}`;

    const newTicket: Ticket = {
      id: tktId,
      type,
      title,
      description,
      priority,
      status: 'Pendiente',
      createdDate: dateStr,
      creator,
      creatorName,
      assignedTo: null,
      assignedToEmail: null,
      lab: lab || 'N/A',
      pc: pc || 'N/A',
      history: [
        {
          action: 'Creación',
          description: `Ticket ${tktId} de tipo "${type}" creado por el docente ${creatorName}.`,
          date: dateStr,
          user: creator
        }
      ],
      chat: [] // chat se crea automáticamente vacío
    };

    tickets.push(newTicket);
    this.saveLocalTickets(tickets);

    // Registrar en auditoría global
    this.addGlobalAudit('Creación', `Ticket ${tktId} de tipo "${type}" creado automáticamente por el sistema.`, creator, tktId);

    // Toast Notification
    this.toastService.showSuccess('Ticket Creado', `Se ha generado el ticket ${tktId} de tipo ${type} correctamente.`);

    return of(newTicket);
  }

  assignTicket(ticketId: string, tecnicoName: string): Observable<Ticket> {
    const tickets = this.getLocalTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      return throwError(() => new Error('Ticket no encontrado.'));
    }

    const ticket = tickets[ticketIndex];

    if (ticket.status !== 'Pendiente' || ticket.assignedTo !== null) {
      return throwError(() => new Error('El ticket no se encuentra en estado Pendiente o ya tiene un técnico asignado.'));
    }

    // Limit check for bolsistas: max 12 active tickets (status !== Finalizado)
    if (tecnicoName.includes('(Bolsista)')) {
      const activeCount = tickets.filter(
        t => t.assignedTo === tecnicoName && t.status !== 'Finalizado'
      ).length;
      if (activeCount >= 12) {
        this.toastService.showError('Conflicto de Asignación', `El bolsista ${tecnicoName} ya tiene el límite de 12 tickets activos.`);
        return throwError(() => new Error('limit_reached'));
      }
    }

    const now = new Date();
    const dateStr = this.formatDate(now);

    ticket.assignedTo = tecnicoName;
    // Map email
    ticket.assignedToEmail = tecnicoName.includes('Juan') 
      ? 'juan.perez@sigslab.com' 
      : tecnicoName.includes('María') 
        ? 'maria.gomez@sigslab.com' 
        : 'carlos.lopez@sigslab.com';

    ticket.status = 'Asignado';

    const log: AuditLog = {
      action: 'Asignación',
      description: `Técnico asignado: ${tecnicoName}. Estado actualizado a "Asignado".`,
      date: dateStr,
      user: 'jefe@sigslab.com'
    };
    ticket.history.push(log);

    this.saveLocalTickets(tickets);

    // Registrar en auditoría global
    this.addGlobalAudit('Asignación', `Ticket ${ticketId} asignado a ${tecnicoName}.`, 'jefe@sigslab.com', ticketId);

    // Toast Notification
    this.toastService.showSuccess('Ticket Asignado', `El ticket ${ticketId} ha sido asignado a ${tecnicoName}.`);

    return of(ticket);
  }

  reassignTicket(ticketId: string, tecnicoName: string): Observable<Ticket> {
    const tickets = this.getLocalTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      return throwError(() => new Error('Ticket no encontrado.'));
    }

    const ticket = tickets[ticketIndex];

    if (ticket.status === 'Finalizado') {
      return throwError(() => new Error('No se pueden reasignar tickets que ya han sido finalizados.'));
    }

    const oldTecnico = ticket.assignedTo || 'Ninguno';
    const now = new Date();
    const dateStr = this.formatDate(now);

    // Limit check for bolsistas: max 12 active tickets (status !== Finalizado)
    if (tecnicoName.includes('(Bolsista)')) {
      const activeCount = tickets.filter(
        t => t.assignedTo === tecnicoName && t.status !== 'Finalizado'
      ).length;
      if (activeCount >= 12) {
        this.toastService.showError('Conflicto de Reasignación', `El bolsista ${tecnicoName} ya tiene el límite de 12 tickets activos.`);
        return throwError(() => new Error('limit_reached'));
      }
    }

    ticket.assignedTo = tecnicoName;
    ticket.assignedToEmail = tecnicoName.includes('Juan') 
      ? 'juan.perez@sigslab.com' 
      : tecnicoName.includes('María') 
        ? 'maria.gomez@sigslab.com' 
        : 'carlos.lopez@sigslab.com';

    ticket.status = 'Asignado'; // Vuelve a estado Asignado si estaba en proceso

    const log: AuditLog = {
      action: 'Reasignación',
      description: `Reasignado de ${oldTecnico} a ${tecnicoName}. Estado restablecido a "Asignado".`,
      date: dateStr,
      user: 'jefe@sigslab.com'
    };
    ticket.history.push(log);

    this.saveLocalTickets(tickets);

    // Registrar en auditoría global
    this.addGlobalAudit('Reasignación', `Ticket ${ticketId} reasignado de ${oldTecnico} a ${tecnicoName}.`, 'jefe@sigslab.com', ticketId);

    // Toast Notification
    this.toastService.showWarning('Ticket Reasignado', `El ticket ${ticketId} fue reasignado a ${tecnicoName}.`);

    return of(ticket);
  }

  startAttention(ticketId: string, tecnicoEmail: string): Observable<Ticket> {
    const tickets = this.getLocalTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      return throwError(() => new Error('Ticket no encontrado.'));
    }

    const ticket = tickets[ticketIndex];
    const now = new Date();
    const dateStr = this.formatDate(now);

    ticket.status = 'En proceso';

    const log: AuditLog = {
      action: 'Inicio de atención',
      description: `El técnico inició la atención presencial/remota del ticket. Estado cambiado a "En proceso".`,
      date: dateStr,
      user: tecnicoEmail
    };
    ticket.history.push(log);

    this.saveLocalTickets(tickets);

    // Registrar en auditoría global
    this.addGlobalAudit('Inicio de atención', `Atención del ticket ${ticketId} iniciada por el técnico.`, tecnicoEmail, ticketId);

    // Toast Notification
    this.toastService.showInfo('Atención Iniciada', `El ticket ${ticketId} ahora se encuentra En Proceso.`);

    return of(ticket);
  }

  saveAttentionProgress(ticketId: string, diagnostic: string, correctiveAction: string, observations: string, tecnicoEmail: string): Observable<Ticket> {
    const tickets = this.getLocalTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      return throwError(() => new Error('Ticket no encontrado.'));
    }

    const ticket = tickets[ticketIndex];
    const now = new Date();
    const dateStr = this.formatDate(now);

    ticket.diagnostic = diagnostic;
    ticket.correctiveAction = correctiveAction;
    ticket.observations = observations;

    const log: AuditLog = {
      action: 'Modificación',
      description: `Técnico guardó avances del diagnóstico y acciones.`,
      date: dateStr,
      user: tecnicoEmail
    };
    ticket.history.push(log);

    this.saveLocalTickets(tickets);

    // Registrar en auditoría global
    this.addGlobalAudit('Guardar avances', `Avances del ticket ${ticketId} guardados por el técnico.`, tecnicoEmail, ticketId);

    this.toastService.showSuccess('Avances Guardados', `Se han registrado los avances del ticket ${ticketId}.`);

    return of(ticket);
  }

  closeTicketFull(ticketId: string, diagnostic: string, correctiveAction: string, observations: string, tecnicoEmail: string): Observable<Ticket> {
    const tickets = this.getLocalTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      return throwError(() => new Error('Ticket no encontrado.'));
    }

    const ticket = tickets[ticketIndex];
    const now = new Date();
    const dateStr = this.formatDate(now);

    ticket.diagnostic = diagnostic;
    ticket.correctiveAction = correctiveAction || 'Sin observaciones registradas.';
    ticket.observations = observations;
    ticket.status = 'Finalizado';
    ticket.endDate = dateStr;

    const log: AuditLog = {
      action: 'Finalización',
      description: `El técnico finalizó la atención. Diagnóstico: "${diagnostic}". Acciones: "${correctiveAction}".`,
      date: dateStr,
      user: tecnicoEmail
    };
    ticket.history.push(log);

    this.saveLocalTickets(tickets);

    // Registrar en auditoría global
    this.addGlobalAudit('Finalización', `Ticket ${ticketId} resuelto y cerrado como Finalizado.`, tecnicoEmail, ticketId);

    // Toast Notification
    this.toastService.showSuccess('Ticket Finalizado', `El ticket ${ticketId} ha sido finalizado con éxito.`);

    return of(ticket);
  }

  // --- CHAT METHODS (MOCK REALTIME) ---

  sendChatMessage(ticketId: string, sender: string, senderName: string, content: string): Observable<Ticket> {
    const tickets = this.getLocalTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      return throwError(() => new Error('Ticket no encontrado.'));
    }

    const ticket = tickets[ticketIndex];
    const now = new Date();
    const dateStr = this.formatDate(now);

    const newMsg: Message = {
      sender,
      senderName,
      content,
      timestamp: dateStr
    };

    ticket.chat.push(newMsg);
    this.saveLocalTickets(tickets);

    // Registra la notificación en la campana del destinatario correspondiente
    if (sender === ticket.creator) {
      if (ticket.assignedToEmail) {
        this.addNotification(ticket.assignedToEmail, `Nuevo mensaje de Docente (${senderName})`, `Ticket ${ticket.id}: ${content}`, 'message');
      }
    } else {
      this.addNotification(ticket.creator, `Nuevo mensaje de Técnico (${senderName})`, `Ticket ${ticket.id}: ${content}`, 'message');
    }

    return of(ticket);
  }

  // --- RESERVATION METHODS ---

  getReservations(): Observable<Reservation[]> {
    return of(this.getLocalReservations());
  }

  addReservation(res: Omit<Reservation, 'id' | 'createdDate'>): Observable<Reservation> {
    const reservations = this.getLocalReservations();

    // Detección de conflictos
    // Convertir horas a minutos para facilitar la comparación de solapamientos
    const parseTimeToMinutes = (timeStr: string): number => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = parseTimeToMinutes(res.startTime);
    const newEnd = parseTimeToMinutes(res.endTime);

    for (const exRes of reservations) {
      // 1. Mismo laboratorio
      if (exRes.lab === res.lab) {
        // 2. Tienen algún día de la semana en común
        const commonDays = res.days.filter(d => exRes.days.includes(d));
        if (commonDays.length > 0) {
          // 3. Solapamiento de horario: newStart < exEnd && newEnd > exStart
          const exStart = parseTimeToMinutes(exRes.startTime);
          const exEnd = parseTimeToMinutes(exRes.endTime);

          if (newStart < exEnd && newEnd > exStart) {
            // Conflicto detectado
            const dayConflict = commonDays[0];
            const msg = `El ${res.lab} ya se encuentra ocupado el ${dayConflict.toLowerCase()} de ${exRes.startTime} a ${exRes.endTime} por la reserva: "${exRes.reason}" (docente: ${exRes.teacher}).`;
            this.toastService.showError('Conflicto de Reservas', msg);
            return throwError(() => new Error(msg));
          }
        }
      }
    }

    // Si no hay conflictos, procedemos a guardar
    const now = new Date();
    const dateStr = this.formatDate(now);
    const newRes: Reservation = {
      ...res,
      id: `RES-${reservations.length + 5003}`,
      createdDate: dateStr
    };

    reservations.push(newRes);
    this.saveLocalReservations(reservations);

    // Registrar en auditoría global
    this.addGlobalAudit('Programación laboratorio', `Nueva reserva registrada para el ${newRes.lab} (${newRes.reason}). Días: ${newRes.days.join(', ')} de ${newRes.startTime} a ${newRes.endTime}.`, res.teacher);

    // Toast notification
    this.toastService.showSuccess('Reserva Registrada', `Se programó el uso del ${newRes.lab} correctamente.`);

    return of(newRes);
  }

  // --- NOTIFICATION METHODS ---

  getNotifications(userEmail: string): Observable<AppNotification[]> {
    const key = `sigslab_notifications_${userEmail}`;
    const data = localStorage.getItem(key);
    if (!data) {
      const defaults: AppNotification[] = [
        {
          id: 'notif-1',
          title: 'Bienvenido a SIGSLAB',
          body: 'Desde esta consola puede gestionar sus tickets e incidencias.',
          timestamp: 'Ayer',
          read: false,
          type: 'system'
        }
      ];
      localStorage.setItem(key, JSON.stringify(defaults));
      return of(defaults);
    }
    return of(JSON.parse(data));
  }

  saveNotifications(userEmail: string, notifs: AppNotification[]): void {
    const key = `sigslab_notifications_${userEmail}`;
    localStorage.setItem(key, JSON.stringify(notifs));
  }

  addNotification(userEmail: string, title: string, body: string, type: 'message' | 'ticket' | 'system' = 'message'): void {
    const key = `sigslab_notifications_${userEmail}`;
    const data = localStorage.getItem(key);
    let notifs: AppNotification[] = [];
    if (data) {
      notifs = JSON.parse(data);
    } else {
      notifs = [
        {
          id: 'notif-1',
          title: 'Bienvenido a SIGSLAB',
          body: 'Desde esta consola puede gestionar sus tickets e incidencias.',
          timestamp: 'Ayer',
          read: false,
          type: 'system'
        }
      ];
    }
    const dateStr = this.formatDate(new Date());
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      timestamp: dateStr,
      read: false,
      type
    };
    notifs.unshift(newNotif);
    this.saveNotifications(userEmail, notifs);
  }

  markNotificationsAsRead(userEmail: string): Observable<boolean> {
    const key = `sigslab_notifications_${userEmail}`;
    const data = localStorage.getItem(key);
    if (data) {
      const notifs: AppNotification[] = JSON.parse(data);
      notifs.forEach(n => n.read = true);
      localStorage.setItem(key, JSON.stringify(notifs));
    }
    return of(true);
  }

  // --- GLOBAL HISTORY METHODS ---

  getGlobalHistory(): Observable<GlobalAudit[]> {
    // Retorna ordenado por fecha descendiente (más reciente primero)
    return of([...this.getLocalHistory()].reverse());
  }
}
