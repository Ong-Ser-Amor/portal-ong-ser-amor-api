import { PlanoCurso } from 'src/planos-curso/entities/plano-curso.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TurmaProfessor } from './turma-professor';
import { CriterioAvaliacao } from '../enums/criterio-avaliacao.enum';
import { StatusTurma } from '../enums/status-turma.enum';

@Entity('turmas')
export class Turma {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'plano_curso_id', type: 'bigint' })
  planoCursoId: string;

  @ManyToOne(() => PlanoCurso)
  @JoinColumn({ name: 'plano_curso_id' })
  planoCurso: PlanoCurso;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ name: 'carga_horaria', type: 'integer' })
  cargaHoraria: number;

  @Column({ name: 'data_inicio', type: 'date' })
  dataInicio: string;

  @Column({ name: 'data_fim', type: 'date' })
  dataFim: string;

  @Column({ type: 'varchar', length: 20, enum: StatusTurma })
  status: StatusTurma;

  @Column({
    name: 'criterio_avaliacao',
    type: 'varchar',
    length: 30,
    enum: CriterioAvaliacao,
  })
  criterioAvaliacao: CriterioAvaliacao;

  @Column({
    name: 'frequencia_minima',
    type: 'integer',
    nullable: true,
  })
  frequenciaMinima: number | null;

  @Column({
    name: 'nota_minima',
    type: 'decimal',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  notaMinima: string | null;

  @OneToMany(() => TurmaProfessor, (turmaProfessor) => turmaProfessor.turma)
  turmasProfessores: TurmaProfessor[];

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<Turma>) {
    Object.assign(this, partial);
  }
}
