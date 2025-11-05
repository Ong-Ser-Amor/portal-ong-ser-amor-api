import { CourseResponseDto } from 'src/courses/dto/course-response.dto';

import { CourseClass } from '../entities/course-class.entity';
import { CourseClassStatus } from '../enums/course-class-status.enum';

export class CourseClassResponseDto {
  id: number;
  course: CourseResponseDto;
  name: string;
  status: CourseClassStatus;
  startDate: Date;
  endDate: Date;
  studentsCount?: number;

  constructor(courseClass: CourseClass & { studentsCount?: number }) {
    this.id = courseClass.id;
    this.name = courseClass.name;
    this.status = courseClass.status;
    this.course = new CourseResponseDto(courseClass.course);
    this.startDate = courseClass.startDate;
    this.endDate = courseClass.endDate;
    this.studentsCount = courseClass.studentsCount;
  }
}
