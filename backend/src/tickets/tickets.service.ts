import { Injectable, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService implements OnModuleInit {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>
  ) {}

  async onModuleInit() {
    await this.seedTickets();
  }

  async seedTickets() {
    const count = await this.ticketRepository.count();
    if (count === 0) {
      const defaultTickets: Partial<Ticket>[] = [
        {
          id: 'T-1001',
          type: 'Incidente',
          lab: 'Laboratorio 101 (Cómputo)',
          pc: 'PC-12',
          description: 'El teclado no responde y tres teclas están físicamente trabadas.',
          status: 'Pendiente',
          createdDate: '2026-06-08 09:30',
          creator: 'docente@sigslab.edu',
          assignedTo: null,
          correctiveAction: null
        },
        {
          id: 'T-1002',
          type: 'Software',
          lab: 'Laboratorio 201 (Electrónica)',
          pc: 'Todas las PCs',
          description: 'MATLAB R2024a con toolbox de control y procesamiento de señales.',
          status: 'Pendiente',
          createdDate: '2026-06-09 14:15',
          creator: 'docente@sigslab.edu',
          assignedTo: null,
          correctiveAction: null
        },
        {
          id: 'T-1003',
          type: 'Incidente',
          lab: 'Laboratorio de Redes',
          pc: 'PC-04',
          description: 'No conecta a internet. El cable de red parece estar bien pero no obtiene dirección IP por DHCP.',
          status: 'Asignado',
          createdDate: '2026-06-10 08:00',
          creator: 'docente@sigslab.edu',
          assignedTo: 'Juan Pérez (Bolsista)',
          correctiveAction: null
        },
        {
          id: 'T-1004',
          type: 'Incidente',
          lab: 'Laboratorio 102 (Sistemas)',
          pc: 'PC-25',
          description: 'Pantalla azul al iniciar el sistema operativo Windows 11.',
          status: 'Finalizado',
          createdDate: '2026-06-05 10:00',
          creator: 'docente@sigslab.edu',
          assignedTo: 'María Gómez (Técnico)',
          correctiveAction: 'Se procedió a reiniciar el equipo y verificar el código de error en la pantalla azul (PAGE_FAULT_IN_NONPAGED_AREA). Se ingresó en modo seguro y se detectó que el controlador de la tarjeta gráfica integrada estaba corrupto tras una actualización automática fallida del sistema operativo. Se procedió a desinstalar completamente el driver corrupto usando la herramienta DDU en modo seguro. Posteriormente, se descargó e instaló la versión estable más reciente del controlador desde la web oficial del fabricante. Se realizaron tres pruebas de reinicio y benchmarks básicos de carga de video para asegurar la estabilidad del sistema. El equipo ya inicia correctamente y no muestra fallos.'
        }
      ];

      for (const t of defaultTickets) {
        await this.ticketRepository.save(this.ticketRepository.create(t));
      }
      console.log('Tickets de prueba sembrados exitosamente.');
    }
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find();
  }

  async findByCreator(email: string): Promise<Ticket[]> {
    return this.ticketRepository.find({ where: { creator: email } });
  }

  async findByAssigned(tecnicoName: string): Promise<Ticket[]> {
    return this.ticketRepository.find({ where: { assignedTo: tecnicoName } });
  }

  async create(ticketData: {
    type: 'Incidente' | 'Software';
    lab: string;
    pc: string;
    description: string;
    creator: string;
  }): Promise<Ticket> {
    const tickets = await this.ticketRepository.find();
    // Generate new T-XXXX id
    const nextIdNum = 1000 + tickets.length + 1;
    const newId = `T-${nextIdNum}`;

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

    const newTicket = this.ticketRepository.create({
      id: newId,
      type: ticketData.type,
      lab: ticketData.lab,
      pc: ticketData.pc || 'N/A',
      description: ticketData.description,
      status: 'Pendiente',
      createdDate: dateStr,
      creator: ticketData.creator,
      assignedTo: null,
      correctiveAction: null
    });

    return this.ticketRepository.save(newTicket);
  }

  async assign(ticketId: string, tecnicoName: string): Promise<Ticket> {
    const activeCount = await this.ticketRepository.count({
      where: { assignedTo: tecnicoName, status: Not('Finalizado') }
    });

    if (activeCount >= 12) {
      throw new BadRequestException('limit_reached');
    }

    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado.');
    }

    ticket.assignedTo = tecnicoName;
    ticket.status = 'Asignado';

    return this.ticketRepository.save(ticket);
  }

  async close(ticketId: string, correctiveAction: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado.');
    }

    ticket.correctiveAction = correctiveAction || 'Sin observaciones registradas.';
    ticket.status = 'Finalizado';

    return this.ticketRepository.save(ticket);
  }
}
