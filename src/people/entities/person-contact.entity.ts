import { Contact } from 'src/contacts/entities/contact.entity';
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

import { Person } from './person.entity';

@Entity('person_contacts')
export class PersonContact {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ name: 'person_id', type: 'bigint' })
  personId: string;

  @Column({ name: 'contact_id', type: 'bigint' })
  contactId: string;

  @Column({ name: 'is_main', type: 'boolean', default: false })
  isMain: boolean;

  // Mapeamento da Chave Estrangeira para a tabela de Pessoas
  @ManyToOne(() => Person, (person) => person.personContacts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  // Mapeamento da Chave Estrangeira para a tabela de Contatos
  @ManyToOne(() => Contact, (contact) => contact.personContacts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  constructor(partial: Partial<PersonContact>) {
    Object.assign(this, partial);
  }
}
