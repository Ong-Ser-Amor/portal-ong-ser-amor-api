import { CreateStudentDto } from '../dto/create-student.dto';

export const mockCreateStudentDto: CreateStudentDto = {
  name: 'Mock Student',
  birthDate: new Date('2010-01-01'),
};

export const mockStudent = {
  id: 1,
  name: 'Mock Student',
  birthDate: new Date('2010-01-01'),
  createdAt: new Date('2025-09-17T15:00:00.000Z'),
  updatedAt: new Date('2025-09-17T15:00:00.000Z'),
  deletedAt: null,
};

export const mockStudentList = [
  mockStudent,
  { ...mockStudent, id: 2, name: 'Mock Student 2' },
];
