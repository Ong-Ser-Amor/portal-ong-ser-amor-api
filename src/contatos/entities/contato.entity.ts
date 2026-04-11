import { TipoContato } from 'src/contacts/enums/tipo-contato.enum';
import {
  UpdateDateColumn,
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('contatos')
export class Contato {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ name: 'tipo_contato', type: 'varchar', length: 50 })
  tipoContato: TipoContato;

  @Column({ type: 'varchar', length: 100 })
  valor: string;

  @CreateDateColumn({ name: 'criado_em', nullable: false })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', nullable: false })
  atualizadoEm: Date;

  @DeleteDateColumn({ name: 'deletado_em', type: 'timestamp', nullable: true })
  deletadoEm: Date | null;

  constructor(partial: Partial<Contato>) {
    Object.assign(this, partial);
  }
}
