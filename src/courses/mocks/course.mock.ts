import { CreateCourseDto } from '../dto/create-course.dto';

export const mockCreateCourseDto: CreateCourseDto = {
  name: 'Mock Course',
};

export const mockCourse = {
  id: 1,
  name: 'Mock Course',
  createdAt: new Date('2025-09-17T15:00:00.000Z'),
  updatedAt: new Date('2025-09-17T15:00:00.000Z'),
  deletedAt: null,
};

export const mockCourseList = [
  mockCourse,
  { ...mockCourse, id: 2, name: 'Mock Course 2' },
];
