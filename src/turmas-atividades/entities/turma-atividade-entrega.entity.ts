import { TurmaMatricula } from 'src/turmas-matriculas/entities/turmas-matricula.entity';
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

import { TurmaAtividade } from './turmas-atividade.entity';
import { StatusEntrega } from '../enums/status-entrega.enum';

@Entity('turmas_atividades_entregas')
export class TurmaAtividadeEntrega {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'atividade_id', type: 'bigint' })
  atividadeId: string;

  @Column({ name: 'matricula_id', type: 'bigint' })
  matriculaId: string;

  @Column({
    name: 'status_entrega',
    type: 'varchar',
    length: 30,
    enum: StatusEntrega,
    default: StatusEntrega.PENDENTE,
  })
  statusEntrega: StatusEntrega;

  @Column({
    name: 'nota_obtida',
    type: 'decimal',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  notaObtida: number | null;

  @Column({ name: 'data_entrega', type: 'date', nullable: true })
  dataEntrega: Date | null;

  @Column({ type: 'text', nullable: true })
  observacao: string | null;

  // =========================================================
  // RELACIONAMENTOS
  // =========================================================

  @ManyToOne(() => TurmaAtividade)
  @JoinColumn({ name: 'atividade_id' })
  atividade: TurmaAtividade;

  @ManyToOne(() => TurmaMatricula)
  @JoinColumn({ name: 'matricula_id' })
  matricula: TurmaMatricula;

  // =========================================================
  // AUDITORIA
  // =========================================================

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<TurmaAtividadeEntrega>) {
    Object.assign(this, partial);
  }
}
