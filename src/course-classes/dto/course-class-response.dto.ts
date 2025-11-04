import { CourseResponseDto } from 'src/courses/dto/course-response.dto';
import { StudentResponseDto } from 'src/students/dto/student-response.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

import { CourseClass } from '../entities/course-class.entity';
import { CourseClassStatus } from '../enums/course-class-status.enum';

export class CourseClassResponseDto {
  id: number;
  course: CourseResponseDto;
  name: string;
  status: CourseClassStatus;
  startDate: Date;
  endDate: Date;
  teachers: UserResponseDto[];
  students: StudentResponseDto[];

  constructor(courseClass: CourseClass) {
    this.id = courseClass.id;
    this.name = courseClass.name;
    this.status = courseClass.status;
    this.course = new CourseResponseDto(courseClass.course);
    this.startDate = courseClass.startDate;
    this.endDate = courseClass.endDate;

    if (courseClass.teachers) {
      this.teachers = courseClass.teachers.map(
        (teacher) => new UserResponseDto(teacher),
      );
    }

    if (courseClass.students) {
      this.students = courseClass.students.map(
        (student) => new StudentResponseDto(student),
      );
    }
  }
}
