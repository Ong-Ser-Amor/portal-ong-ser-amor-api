import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddTeacherDto {
  @ApiProperty({
    description: 'The ID of the user (teacher) to be added to the class',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  teacherId: number;
}
