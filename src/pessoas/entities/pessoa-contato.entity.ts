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

import { Pessoa } from './pessoa.entity';
import { Contato } from '../../contatos/entities/contato.entity';

@Entity('pessoas_contatos')
export class PessoaContato {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ name: 'pessoa_id', type: 'bigint' })
  pessoaId: string;

  @Column({ name: 'contato_id', type: 'bigint' })
  contatoId: string;

  @Column({ name: 'eh_principal', type: 'boolean', default: false })
  ehPrincipal: boolean;

  @ManyToOne(() => Pessoa, (pessoa) => pessoa.contatos, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'pessoa_id' })
  pessoa: Pessoa;

  @ManyToOne(() => Contato, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'contato_id' })
  contato: Contato;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<PessoaContato>) {
    Object.assign(this, partial);
  }
}
