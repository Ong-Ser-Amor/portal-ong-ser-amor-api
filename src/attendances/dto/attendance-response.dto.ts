import { LessonResponseDto } from 'src/lessons/dto/lesson-response.dto';
import { StudentResponseDto } from 'src/students/dto/student-response.dto';

import { Attendance } from '../entities/attendance.entity';

export class AttendanceResponseDto {
  id: number;
  present: boolean;
  notes?: string;
  student: StudentResponseDto;
  lesson: LessonResponseDto;

  constructor(attendance: Attendance) {
    this.id = attendance.id;
    this.present = attendance.present;
    this.notes = attendance.notes;

    if (attendance.student) {
      this.student = new StudentResponseDto(attendance.student);
    }
    if (attendance.lesson) {
      this.lesson = new LessonResponseDto(attendance.lesson);
    }
  }
}
