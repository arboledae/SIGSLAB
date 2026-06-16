export interface Ticket {
  id: string;
  type: 'Incidente' | 'Software';
  lab: string;
  pc: string;
  description: string;
  status: 'Pendiente' | 'Asignado' | 'Finalizado';
  createdDate: string;
  creator: string;
  assignedTo: string | null;
  correctiveAction: string | null;
}
