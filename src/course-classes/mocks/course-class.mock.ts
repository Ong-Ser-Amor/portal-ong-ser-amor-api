import { mockCourse } from 'src/courses/mocks/course.mock';
import { mockTeacher } from 'src/users/mocks/user.mock';

import { CreateCourseClassDto } from '../dto/create-course-class.dto';
import { CourseClass } from '../entities/course-class.entity';
import { CourseClassStatus } from '../enums/course-class-status.enum';

export const mockCreateCourseClassDto: CreateCourseClassDto = {
  courseId: 1,
  name: 'Mock Course Class',
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-12-31'),
};

export const mockCourseClass: CourseClass = {
  id: 1,
  name: 'Mock Course Class',
  status: CourseClassStatus.EM_ANDAMENTO,
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-12-31'),
  course: mockCourse,
  teachers: [],
  students: [],
  lessons: [],
  createdAt: new Date('2025-09-17T15:00:00.000Z'),
  updatedAt: new Date('2025-09-17T15:00:00.000Z'),
  deletedAt: null,
};

export const mockCourseClassWithTeacher: CourseClass = {
  ...mockCourseClass,
  teachers: [mockTeacher],
};

export const mockCourseClassList: CourseClass[] = [
  mockCourseClass,
  {
    ...mockCourseClass,
    id: 2,
    name: 'Mock Course Class 2',
    course: { ...mockCourse, id: 2, name: 'Mock Course 2' },
    teachers: [mockTeacher],
  },
];
