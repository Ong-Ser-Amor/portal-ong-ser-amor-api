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

import { PersonContact } from './person-contact.entity';

@Entity('people')
export class Person {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({
    name: 'cpf',
    type: 'varchar',
    length: 11,
    nullable: false,
    unique: true,
  })
  cpf: string;

  @Column({ name: 'birth_date', type: 'date', nullable: false })
  birthDate: Date;

  @Column({ name: 'can_leave_alone', type: 'boolean', nullable: true })
  canLeaveAlone: boolean;

  @Column({ name: 'guardian_id', type: 'bigint', nullable: true })
  guardianId: string;

  // O "Lado Dono" do relacionamento (Quem tem a chave estrangeira)
  @ManyToOne(() => Person, (person) => person.dependents, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'guardian_id' })
  guardian: Person;

  // O "Lado Inverso" (Para poder buscar uma pessoa e ver todos os dependentes dela de uma vez)
  @OneToMany(() => Person, (person) => person.guardian)
  dependents: Person[];

  @OneToMany(() => PersonContact, (personContact) => personContact.person)
  personContacts: PersonContact[];

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  constructor(partial: Partial<Person>) {
    Object.assign(this, partial);
  }
}
