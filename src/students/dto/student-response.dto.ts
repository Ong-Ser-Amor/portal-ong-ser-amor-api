import { ApiProperty } from '@nestjs/swagger';

import { Student } from '../entities/student.entity';

export class StudentResponseDto {
  @ApiProperty({ example: 1, description: 'Student ID' })
  id: number;

  @ApiProperty({ example: 'João Silva', description: 'Student name' })
  name: string;

  @ApiProperty({
    example: '2010-05-15',
    description: 'Student birth date (date only, no time)',
    type: 'string',
    format: 'date',
  })
  birthDate: Date;

  constructor(student: Student) {
    this.id = student.id;
    this.name = student.name;
    this.birthDate = student.birthDate;
  }
}
