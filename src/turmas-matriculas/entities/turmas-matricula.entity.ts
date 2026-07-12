import { Beneficiario } from 'src/beneficiarios/entities/beneficiario.entity';
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

import { ResultadoFinalMatricula } from '../enums/resultado-final-matricula.enum';
import { StatusMatricula } from '../enums/status-matricula.enum';

@Entity('turmas_matriculas')
export class TurmaMatricula {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'turma_id', type: 'bigint' })
  turmaId: string;

  @Column({ name: 'beneficiario_id', type: 'bigint' })
  beneficiarioId: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: StatusMatricula,
  })
  status: StatusMatricula;

  @Column({
    name: 'resultado_final',
    type: 'varchar',
    length: 20,
    enum: ResultadoFinalMatricula,
    nullable: true,
  })
  resultadoFinal: ResultadoFinalMatricula | null;

  @Column({
    name: 'nota_final',
    type: 'decimal',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  notaFinal: string | null;

  @Column({
    name: 'parecer_pedagogico',
    type: 'text',
    nullable: true,
  })
  parecerPedagogico: string | null;

  // =========================================================
  // RELACIONAMENTOS
  // =========================================================

  @ManyToOne(() => Turma)
  @JoinColumn({ name: 'turma_id' })
  turma: Turma;

  @ManyToOne(() => Beneficiario)
  @JoinColumn({ name: 'beneficiario_id' })
  beneficiario: Beneficiario;

  // =========================================================
  // AUDITORIA
  // =========================================================

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<TurmaMatricula>) {
    Object.assign(this, partial);
  }
}
