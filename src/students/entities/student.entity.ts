import { Attendance } from 'src/attendances/entities/attendance.entity';
import { CourseClass } from 'src/course-classes/entities/course-class.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'student' })
export class Student {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({
    name: 'birth_date',
    type: 'date',
    nullable: false,
  })
  birthDate: Date;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToMany(() => CourseClass, (courseClass) => courseClass.students)
  courseClasses: CourseClass[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  constructor(partial: Partial<Student>) {
    Object.assign(this, partial);
  }
}
