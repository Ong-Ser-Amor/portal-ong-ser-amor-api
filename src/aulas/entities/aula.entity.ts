import { Turma } from 'src/turmas/entities/turma.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { StatusAula } from '../enums/status-aula.enum';

@Entity('aulas')
export class Aula {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'turma_id', type: 'bigint' })
  turmaId: string;

  @Column({ type: 'date' })
  data: string;

  @Column({ type: 'varchar', length: 255 })
  tema: string;

  @Column({
    type: 'varchar',
    length: 30,
    enum: StatusAula,
  })
  status: StatusAula;

  // =========================================================
  // RELACIONAMENTOS
  // =========================================================

  @ManyToOne(() => Turma)
  @JoinColumn({ name: 'turma_id' })
  turma: Turma;

  // =========================================================
  // AUDITORIA
  // =========================================================

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<Aula>) {
    Object.assign(this, partial);
  }
}
