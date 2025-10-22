import { CreateStudentDto } from '../dto/create-student.dto';
import { Student } from '../entities/student.entity';

export const mockCreateStudentDto: CreateStudentDto = {
  name: 'Mock Student',
  birthDate: new Date('2010-01-01'),
};

export const mockStudent: Student = {
  id: 1,
  name: 'Mock Student',
  birthDate: new Date('2010-01-01'),
  createdAt: new Date('2025-09-17T15:00:00.000Z'),
  updatedAt: new Date('2025-09-17T15:00:00.000Z'),
  deletedAt: null,
  courseClasses: [],
  attendances: [],
};

export const mockStudentList: Student[] = [
  mockStudent,
  { ...mockStudent, id: 2, name: 'Mock Student 2' },
];
