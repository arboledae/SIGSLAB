export interface AuditLog {
  action: string;      // e.g. "Creación", "Asignación", "Reasignación", "Inicio de atención", "Finalización", "Programación"
  description: string; // detalle
  date: string;        // YYYY-MM-DD HH:MM
  user: string;        // ejecutor (email o "Sistema")
}

export interface Message {
  sender: string;      // email de quien envía
  senderName: string;  // nombre legible
  content: string;     // texto
  timestamp: string;   // YYYY-MM-DD HH:MM
}

export interface Ticket {
  id: string;          // código único
  type: 'Incidente' | 'Solicitud de instalación' | 'Solicitud de apertura';
  title: string;
  description: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Pendiente' | 'Asignado' | 'En proceso' | 'Finalizado';
  createdDate: string;
  creator: string;     // email docente
  creatorName?: string; // nombre docente
  assignedTo: string | null; // nombre del técnico
  assignedToEmail?: string | null; // email del técnico
  history: AuditLog[];
  chat: Message[];
  diagnostic?: string | null;
  correctiveAction?: string | null;
  observations?: string | null;
  endDate?: string | null;
  lab?: string;        // Laboratorio
  pc?: string;         // PC afectada (opcional, por ejemplo N/A o PC-05)
}
