import { PersonContact } from 'src/people/entities/person-contact.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ContactType } from '../enums/contact-type.enum';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ name: 'contact_type', type: 'varchar', length: 50 })
  contactType: ContactType;

  @Column({ type: 'varchar', length: 100 })
  value: string;

  @OneToMany(() => PersonContact, (personContact) => personContact.contact)
  personContacts: PersonContact[];

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  constructor(partial: Partial<Contact>) {
    Object.assign(this, partial);
  }
}
