import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  async findAll(): Promise<Ticket[]> {
    return this.ticketsService.findAll();
  }

  @Get('creator/:email')
  async findByCreator(@Param('email') email: string): Promise<Ticket[]> {
    return this.ticketsService.findByCreator(email);
  }

  @Get('assigned/:name')
  async findByAssigned(@Param('name') name: string): Promise<Ticket[]> {
    return this.ticketsService.findByAssigned(name);
  }

  @Post()
  async create(
    @Body()
    createDto: {
      type: 'Incidente' | 'Software';
      lab: string;
      pc: string;
      description: string;
      creator: string;
    }
  ): Promise<Ticket> {
    return this.ticketsService.create(createDto);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body('name') name: string
  ): Promise<Ticket> {
    return this.ticketsService.assign(id, name);
  }

  @Post(':id/close')
  async close(
    @Param('id') id: string,
    @Body('correctiveAction') correctiveAction: string
  ): Promise<Ticket> {
    return this.ticketsService.close(id, correctiveAction);
  }
}
