import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = '/api/tickets';

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

  constructor(private http: HttpClient) {}

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  getTicketsByCreator(email: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/creator/${email}`);
  }

  getTicketsByAssigned(name: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/assigned/${name}`);
  }

  createTicket(
    type: 'Incidente' | 'Software',
    lab: string,
    pc: string,
    description: string,
    creator: string
  ): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, {
      type,
      lab,
      pc,
      description,
      creator
    });
  }

  assignTicket(ticketId: string, tecnicoName: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/${ticketId}/assign`, {
      name: tecnicoName
    });
  }

  closeTicket(ticketId: string, correctiveAction: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/${ticketId}/close`, {
      correctiveAction
    });
  }

  getTechnicians(): Observable<User[]> {
    return this.http.get<User[]>('/api/auth/technicians');
  }
}
