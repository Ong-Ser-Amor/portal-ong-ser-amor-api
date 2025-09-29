import { CourseResponseDto } from 'src/courses/dto/course-response.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

import { CourseClass } from '../entities/course-class.entity';

export class CourseClassResponseDto {
  id: number;
  course: CourseResponseDto;
  name: string;
  startDate: Date;
  endDate: Date;
  teachers: UserResponseDto[];

  constructor(courseClass: CourseClass) {
    this.id = courseClass.id;
    this.name = courseClass.name;
    this.course = new CourseResponseDto(courseClass.course);
    this.startDate = courseClass.startDate;
    this.endDate = courseClass.endDate;

    if (courseClass.teachers) {
      this.teachers = courseClass.teachers.map(
        (teacher) => new UserResponseDto(teacher),
      );
    }
  }
}
