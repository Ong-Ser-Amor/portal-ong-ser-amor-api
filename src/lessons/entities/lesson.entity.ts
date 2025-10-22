import { Attendance } from 'src/attendances/entities/attendance.entity';
import { CourseClass } from 'src/course-classes/entities/course-class.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'lesson' })
export class Lesson {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'date', type: 'date', nullable: false })
  date: Date;

  @Column({ name: 'topic', type: 'varchar', length: 255, nullable: true })
  topic: string;

  @Column({ name: 'course_class_id' })
  courseClassId: number;

  @Index()
  @ManyToOne(() => CourseClass, (courseClass) => courseClass.lessons, {
    nullable: false,
  })
  @JoinColumn({ name: 'course_class_id' })
  courseClass: CourseClass;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Attendance, (attendance) => attendance.lesson)
  attendances: Attendance[];

  constructor(partial: Partial<Lesson>) {
    Object.assign(this, partial);
  }
}
