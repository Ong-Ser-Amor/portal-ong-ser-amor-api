import { Voluntario } from 'src/voluntarios/entities/voluntario.entity';
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

import { Turma } from './turma.entity';

@Entity('turmas_professores')
export class TurmaProfessor {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'turma_id', type: 'bigint' })
  turmaId: string;

  @Column({ name: 'professor_id', type: 'bigint' })
  professorId: string;

  // =========================================================
  // RELACIONAMENTOS
  // =========================================================

  @ManyToOne(() => Turma)
  @JoinColumn({ name: 'turma_id' })
  turma: Turma;

  // O professor é um voluntário, então a relação é feita com a entidade Voluntario
  @ManyToOne(() => Voluntario)
  @JoinColumn({ name: 'professor_id' })
  professor: Voluntario;

  // =========================================================
  // AUDITORIA
  // =========================================================

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<TurmaProfessor>) {
    Object.assign(this, partial);
  }
}
