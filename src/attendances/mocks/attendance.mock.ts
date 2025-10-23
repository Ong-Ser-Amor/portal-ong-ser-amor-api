import { mockLesson } from 'src/lessons/mocks/lesson.mock';
import { mockStudent } from 'src/students/mocks/student.mock';

import { CreateAttendanceDto } from '../dto/create-attendance.dto';
import { Attendance } from '../entities/attendance.entity';

export const mockCreateAttendanceDto: CreateAttendanceDto = {
  studentId: 1,
  lessonId: 1,
  present: true,
  notes: 'Não fez os deveres de casa',
};

export const mockAttendance: Attendance = {
  id: 1,
  present: true,
  notes: 'Não fez os deveres de casa',
  student: mockStudent,
  lesson: mockLesson,
  createdAt: new Date('2025-09-17T15:00:00.000Z'),
  updatedAt: new Date('2025-09-17T15:00:00.000Z'),
  deletedAt: null,
};

export const mockAttendanceList: Attendance[] = [
  mockAttendance,
  {
    ...mockAttendance,
    id: 2,
    student: { ...mockStudent, id: 2, name: 'Aluno Mock 2' },
    present: false,
    notes: 'Faltou sem justificativa.',
  },
];
