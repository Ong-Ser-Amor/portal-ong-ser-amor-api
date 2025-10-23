import { Student } from '../entities/student.entity';

export class StudentResponseDto {
  id: number;
  name: string;
  birthDate: Date;

  constructor(student: Student) {
    this.id = student.id;
    this.name = student.name;
    this.birthDate = student.birthDate;
  }
}
