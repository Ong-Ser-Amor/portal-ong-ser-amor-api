import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
