import { Aula } from 'src/aulas/entities/aula.entity';
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

import { MotivoJustificativa } from '../enums/motivo-justificativa.enum';

@Entity('chamadas')
export class Chamada {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'aula_id', type: 'bigint' })
  aulaId: string;

  @Column({ name: 'matricula_id', type: 'bigint' })
  matriculaId: string;

  @Column({ type: 'boolean' })
  presente: boolean;

  @Column({ name: 'falta_justificada', type: 'boolean', default: false })
  faltaJustificada: boolean;

  @Column({
    name: 'motivo_justificativa',
    type: 'varchar',
    length: 30,
    enum: MotivoJustificativa,
    nullable: true,
  })
  motivoJustificativa: MotivoJustificativa | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observacao: string | null;

  // =========================================================
  // RELACIONAMENTOS
  // =========================================================

  @ManyToOne(() => Aula)
  @JoinColumn({ name: 'aula_id' })
  aula: Aula;

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

  constructor(partial: Partial<Chamada>) {
    Object.assign(this, partial);
  }
}
