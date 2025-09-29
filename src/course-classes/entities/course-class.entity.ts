import { Course } from 'src/courses/entities/course.entity';
import { Student } from 'src/students/entities/student.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'course_class' })
export class CourseClass {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'start_date', type: 'date', nullable: false })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: false })
  endDate: Date;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Index()
  @ManyToOne(() => Course, (course: Course) => course.courseClasses)
  @JoinColumn({ name: 'course_id', referencedColumnName: 'id' })
  course: Course;

  @ManyToMany(() => User, (user: User) => user.courseClasses)
  @JoinTable({
    name: 'course_class_teacher',
    joinColumn: { name: 'course_class_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'teacher_id', referencedColumnName: 'id' },
  })
  teachers: User[];

  @ManyToMany(() => Student, (student: Student) => student.courseClasses)
  @JoinTable({
    name: 'course_class_student',
    joinColumn: { name: 'course_class_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'student_id', referencedColumnName: 'id' },
  })
  students: Student[];

  constructor(partial: Partial<CourseClass>) {
    Object.assign(this, partial);
  }
}
