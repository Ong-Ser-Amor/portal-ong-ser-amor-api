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

import { Endereco } from '../../enderecos/entities/endereco.entity';
import { FaixaRenda } from '../enums/faixa-renda.enum';
import { TipoMoradia } from '../enums/tipo-moradia.enum';

@Entity('familias')
export class Familia {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ name: 'faixa_renda', type: 'varchar', length: 50 })
  faixaRenda: FaixaRenda;

  @Column({
    name: 'possui_beneficio_social',
    type: 'boolean',
    default: false,
  })
  possuiBeneficioSocial: boolean;

  @Column({ name: 'tipo_moradia', type: 'varchar', length: 50 })
  tipoMoradia: TipoMoradia;

  @Column({ name: 'endereco_id', type: 'bigint' })
  enderecoId: string;

  @ManyToOne(() => Endereco)
  @JoinColumn({ name: 'endereco_id' })
  endereco: Endereco;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<Familia>) {
    Object.assign(this, partial);
  }
}
