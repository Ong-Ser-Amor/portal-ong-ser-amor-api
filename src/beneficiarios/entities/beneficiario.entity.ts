import { Familia } from 'src/familias/entities/familia.entity';
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  EstadoCivil,
  NivelEscolaridade,
  VinculoEmpregaticio,
} from '../enums/beneficiario.enum';

@Entity('beneficiarios')
export class Beneficiario {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'pessoa_id', type: 'bigint' })
  pessoaId: string;

  @OneToOne(() => Pessoa)
  @JoinColumn({ name: 'pessoa_id' })
  pessoa: Pessoa;

  @Column({ name: 'familia_id', type: 'bigint' })
  familiaId: string;

  @ManyToOne(() => Familia)
  @JoinColumn({ name: 'familia_id' })
  familia: Familia;

  @Column({
    name: 'nivel_escolaridade',
    type: 'enum',
    enum: NivelEscolaridade,
  })
  nivelEscolaridade: NivelEscolaridade;

  @Column({
    name: 'estado_civil',
    type: 'enum',
    enum: EstadoCivil,
    nullable: true,
  })
  estadoCivil?: EstadoCivil;

  @Column({
    name: 'vinculo_empregaticio',
    type: 'enum',
    enum: VinculoEmpregaticio,
    nullable: true,
  })
  vinculoEmpregaticio?: VinculoEmpregaticio;

  @Column({
    name: 'quantidade_filhos',
    type: 'integer',
    default: 0,
    nullable: true,
  })
  quantidadeFilhos: number | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp' })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<Beneficiario>) {
    Object.assign(this, partial);
  }
}
