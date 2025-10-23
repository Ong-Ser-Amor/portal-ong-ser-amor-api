import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Student } from 'src/students/entities/student.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'attendance' })
@Unique(['student', 'lesson'])
export class Attendance {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'present', type: 'boolean', nullable: false, default: false })
  present: boolean;

  @Column({ name: 'notes', type: 'varchar', length: 500, nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Lesson, (lesson: Lesson) => lesson.attendances, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id', referencedColumnName: 'id' })
  lesson: Lesson;

  @Index()
  @ManyToOne(() => Student, (student: Student) => student.attendances, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id', referencedColumnName: 'id' })
  student: Student;

  constructor(partial: Partial<Attendance>) {
    Object.assign(this, partial);
  }
}
