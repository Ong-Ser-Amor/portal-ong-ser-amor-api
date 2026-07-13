import { CourseClass } from 'src/course-classes/entities/course-class.entity';
import { mockCourseClass } from 'src/course-classes/mocks/course-class.mock';

import { CreateLessonDto } from '../dto/create-lesson.dto';
import { Lesson } from '../entities/lesson.entity';

export const mockCreateLessonDto: CreateLessonDto = {
  courseClassId: 1,
  date: new Date('2025-11-01'),
  topic: 'Lesson 1: Introduction',
};

export const mockLesson: Lesson = {
  id: 1,
  date: new Date('2025-11-01'),
  topic: 'Lesson 1: Introduction',
  courseClassId: mockCourseClass.id,
  courseClass: { id: mockCourseClass.id } as CourseClass,
  createdAt: new Date('2025-09-17T15:00:00.000Z'),
  updatedAt: new Date('2025-09-17T15:00:00.000Z'),
  deletedAt: null,
};

export const mockLessonList: Lesson[] = [
  mockLesson,
  {
    ...mockLesson,
    id: 2,
    date: new Date('2025-11-08'),
    topic: 'Lesson 1: Introduction 2',
    courseClassId: mockCourseClass.id,
  },
];
