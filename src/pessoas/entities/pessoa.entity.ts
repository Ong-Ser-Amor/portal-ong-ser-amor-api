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

import { PessoaContato } from './pessoa-contato.entity';

@Entity('pessoas')
export class Pessoa {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ name: 'nome', type: 'varchar', length: 100, nullable: false })
  nome: string;

  @Column({
    name: 'cpf',
    type: 'varchar',
    length: 11,
    nullable: false,
    unique: true,
  })
  cpf: string;

  @Column({ name: 'data_nascimento', type: 'date', nullable: false })
  dataNascimento: Date;

  @Column({ name: 'emancipado', type: 'boolean', default: false })
  emancipado: boolean;

  @Column({ name: 'pode_sair_sozinho', type: 'boolean', nullable: true })
  podeSairSozinho: boolean;

  @Column({ name: 'responsavel_id', type: 'bigint', nullable: true })
  responsavelId: string;

  // O "Lado Dono" do relacionamento (Quem tem a chave estrangeira)
  @ManyToOne(() => Pessoa, (pessoa) => pessoa.dependentes, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'responsavel_id' })
  responsavel: Pessoa;

  // O "Lado Inverso" (Para poder buscar uma pessoa e ver todos os dependentes dela de uma vez)
  @OneToMany(() => Pessoa, (pessoa) => pessoa.responsavel)
  dependentes: Pessoa[];

  @OneToMany(() => PessoaContato, (pessoaContato) => pessoaContato.pessoa)
  contatos: PessoaContato[];

  @CreateDateColumn({ name: 'criado_em', nullable: false })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', nullable: false })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<Pessoa>) {
    Object.assign(this, partial);
  }
}
