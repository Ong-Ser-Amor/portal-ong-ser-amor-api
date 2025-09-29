import { CreateCourseDto } from '../dto/create-course.dto';
import { Course } from '../entities/course.entity';

export const mockCreateCourseDto: CreateCourseDto = {
  name: 'Mock Course',
};

export const mockCourse: Course = {
  id: 1,
  name: 'Mock Course',
  courseClasses: [],
  createdAt: new Date('2025-09-17T15:00:00.000Z'),
  updatedAt: new Date('2025-09-17T15:00:00.000Z'),
  deletedAt: null,
};

export const mockCourseList: Course[] = [
  mockCourse,
  { ...mockCourse, id: 2, name: 'Mock Course 2' },
];
