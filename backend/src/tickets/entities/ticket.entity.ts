import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar' })
  type!: 'Incidente' | 'Software';

  @Column({ type: 'varchar' })
  lab!: string;

  @Column({ type: 'varchar' })
  pc!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar' })
  status!: 'Pendiente' | 'Asignado' | 'Finalizado';

  @Column({ type: 'varchar' })
  createdDate!: string;

  @Column({ type: 'varchar' })
  creator!: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTo!: string | null;

  @Column({ type: 'text', nullable: true })
  correctiveAction!: string | null;
}
