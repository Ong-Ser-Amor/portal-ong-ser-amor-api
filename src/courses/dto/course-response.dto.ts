import { Course } from '../entities/course.entity';

export class CourseResponseDto {
  id: number;
  name: string;

  constructor(course: Course) {
    this.id = course.id;
    this.name = course.name;
  }
}
