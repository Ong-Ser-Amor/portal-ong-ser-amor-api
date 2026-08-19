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

import { TipoAtividade } from '../enums/tipo-atividade.enum';

@Entity('turmas_atividades')
export class TurmaAtividade {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'turma_id', type: 'bigint' })
  turmaId: string;

  @Column({ type: 'varchar', length: 150 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @Column({
    name: 'tipo_atividade',
    type: 'varchar',
    length: 50,
    enum: TipoAtividade,
  })
  tipoAtividade: TipoAtividade;

  @Column({ name: 'vale_nota', type: 'boolean', default: true })
  valeNota: boolean;

  @Column({
    name: 'nota_maxima',
    type: 'decimal',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  notaMaxima: number | null;

  @Column({ name: 'data_atribuicao', type: 'date' })
  dataAtribuicao: string;

  @Column({ name: 'prazo_entrega', type: 'date' })
  prazoEntrega: string;

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

  constructor(partial: Partial<TurmaAtividade>) {
    Object.assign(this, partial);
  }
}
