import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Uf } from '../enums/uf.enum';

@Entity('enderecos')
export class Endereco {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  logradouro: string;

  @Column({ type: 'varchar', length: 20 })
  numero: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  complemento: string | null;

  @Column({ type: 'varchar', length: 80 })
  bairro: string;

  @Column({ type: 'varchar', length: 80 })
  cidade: string;

  @Column({ type: 'varchar', length: 2 })
  uf: Uf;

  @Column({ type: 'varchar', length: 8 })
  cep: string;

  @CreateDateColumn({ name: 'criado_em', nullable: false })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', nullable: false })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<Endereco>) {
    Object.assign(this, partial);
  }
}
