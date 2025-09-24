import { mockCourse } from 'src/courses/mocks/course.mock';

import { CreateCourseClassDto } from '../dto/create-course-class.dto';

export const mockCreateCourseClassDto: CreateCourseClassDto = {
  courseId: 1,
  name: 'Mock Course Class',
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-12-31'),
};

export const mockCourseClass = {
  id: 1,
  courseId: 1,
  name: 'Mock Course Class',
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-12-31'),
  course: mockCourse,
  createdAt: new Date('2025-09-17T15:00:00.000Z'),
  updatedAt: new Date('2025-09-17T15:00:00.000Z'),
  deletedAt: null,
};

export const mockCourseClassList = [
  mockCourseClass,
  {
    ...mockCourseClass,
    id: 2,
    name: 'Mock Course Class 2',
    course: { ...mockCourse, id: 2, name: 'Mock Course 2' },
  },
];
