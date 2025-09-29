import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddStudentDto {
  @ApiProperty({
    description: 'The ID of the student to be added to the class',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  studentId: number;
}
