import { Person } from 'src/people/entities/person.entity';
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

@Entity('volunteers')
export class Volunteer {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @OneToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({
    name: 'academic_background',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  academicBackground: string | null;

  @Column({
    name: 'education_status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  educationStatus: string | null;

  @Column({
    name: 'volunteer_type',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  volunteerType: string;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  constructor(partial: Partial<Volunteer>) {
    Object.assign(this, partial);
  }
}
