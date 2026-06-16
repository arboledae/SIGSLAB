import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Ticket } from '../models/ticket.model';
import { User } from '../models/user.model';
import { SupabaseService } from './supabase.service';

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

  constructor(private supabase: SupabaseService) {}

  getTickets(): Observable<Ticket[]> {
    return from(
      this.supabase.client
        .from('tickets')
        .select('*')
        .order('createdDate', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw new Error(error.message);
        return (data || []) as Ticket[];
      })
    );
  }

  getTicketsByCreator(email: string): Observable<Ticket[]> {
    return from(
      this.supabase.client
        .from('tickets')
        .select('*')
        .eq('creator', email)
        .order('createdDate', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw new Error(error.message);
        return (data || []) as Ticket[];
      })
    );
  }

  getTicketsByAssigned(name: string): Observable<Ticket[]> {
    return from(
      this.supabase.client
        .from('tickets')
        .select('*')
        .eq('assignedTo', name)
        .order('createdDate', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw new Error(error.message);
        return (data || []) as Ticket[];
      })
    );
  }

  createTicket(
    type: 'Incidente' | 'Software',
    lab: string,
    pc: string,
    description: string,
    creator: string
  ): Observable<Ticket> {
    const now = new Date();
    const dateStr =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0') +
      ' ' +
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0');

    const newTicket = {
      type,
      lab,
      pc: pc || 'N/A',
      description,
      status: 'Pendiente',
      createdDate: dateStr,
      creator,
      assignedTo: null,
      correctiveAction: null
    };

    return from(
      this.supabase.client
        .from('tickets')
        .insert([newTicket])
        .select()
        .single()
     ).pipe(
      map(({ data, error }) => {
        if (error) throw new Error(error.message);
        return data as Ticket;
      })
    );
  }

  assignTicket(ticketId: string, tecnicoName: string): Observable<Ticket> {
    return from(
      this.supabase.client
        .from('tickets')
        .update({ assignedTo: tecnicoName, status: 'Asignado' })
        .eq('id', ticketId)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          if (error.message.includes('limit_reached')) {
            throw new Error('limit_reached');
          }
          throw new Error(error.message);
        }
        return data as Ticket;
      })
    );
  }

  closeTicket(ticketId: string, correctiveAction: string): Observable<Ticket> {
    return from(
      this.supabase.client
        .from('tickets')
        .update({
          correctiveAction: correctiveAction || 'Sin observaciones registradas.',
          status: 'Finalizado'
        })
        .eq('id', ticketId)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw new Error(error.message);
        return data as Ticket;
      })
    );
  }

  getTechnicians(): Observable<User[]> {
    return from(
      this.supabase.client
        .from('profiles')
        .select('*')
        .eq('role', 'tecnico')
    ).pipe(
      map(({ data, error }) => {
        if (error) throw new Error(error.message);
        return (data || []).map(p => ({
          email: p.email,
          name: p.name,
          role: p.role as 'docente' | 'jefe-soporte' | 'tecnico'
        }));
      })
    );
  }
}
