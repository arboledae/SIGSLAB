export interface Reservation {
  id: string;          // identificador único
  lab: string;         // nombre del laboratorio
  reason: string;      // motivo (ej. "Base de Datos")
  teacher: string;     // nombre o correo del docente
  days: string[];      // días de la semana (ej. ["Martes", "Jueves"])
  startTime: string;   // hora de inicio (ej. "10:00")
  endTime: string;     // hora de fin (ej. "12:00")
  repeatWeekly: boolean; // si se repite semanalmente
  repeatUntil?: string;  // fecha límite de repetición (YYYY-MM-DD)
  createdDate: string;
}
