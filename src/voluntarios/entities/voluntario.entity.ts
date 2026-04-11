import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { StatusFormacao, TipoVoluntario } from '../enums/voluntario.enum';

@Entity('voluntarios')
export class Voluntario {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @OneToOne(() => Pessoa)
  @JoinColumn({ name: 'pessoa_id' })
  pessoa: Pessoa;

  @Column({
    name: 'formacao_academica',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  formacaoAcademica: string | null;

  @Column({
    name: 'status_formacao',
    type: 'enum',
    enum: StatusFormacao,
    nullable: true,
  })
  statusFormacao: StatusFormacao | null;

  @Column({
    name: 'tipo_voluntario',
    type: 'enum',
    enum: TipoVoluntario,
    nullable: false,
  })
  tipoVoluntario: TipoVoluntario;

  @CreateDateColumn({ name: 'criado_em', nullable: false })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', nullable: false })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<Voluntario>) {
    Object.assign(this, partial);
  }
}
