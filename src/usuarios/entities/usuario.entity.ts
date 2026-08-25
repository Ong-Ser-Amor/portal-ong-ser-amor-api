import { Voluntario } from 'src/voluntarios/entities/voluntario.entity';
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

import { PerfilAcesso } from '../enums/perfil-acesso.enum';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ name: 'voluntario_id', type: 'bigint' })
  voluntarioId: string;

  @OneToOne(() => Voluntario)
  @JoinColumn({ name: 'voluntario_id' })
  voluntario: Voluntario;

  @Column({
    name: 'perfis_acesso',
    type: 'varchar',
    length: 100,
    array: true,
    nullable: false,
  })
  perfisAcesso: PerfilAcesso[];

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'senha_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
    select: false,
  })
  senhaHash: string;

  @CreateDateColumn({ name: 'criado_em', nullable: false })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', nullable: false })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<Usuario>) {
    Object.assign(this, partial);
  }
}
