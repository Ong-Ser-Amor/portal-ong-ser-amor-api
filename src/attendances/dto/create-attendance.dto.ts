import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'ID of the lesson', example: 1 })
  @IsPositive({ message: 'Lesson ID must be a positive number' })
  @IsInt({ message: 'Lesson ID must be an integer' })
  lessonId: number;

  @ApiProperty({ description: 'ID of the student', example: 1 })
  @IsPositive({ message: 'Student ID must be a positive number' })
  @IsInt({ message: 'Student ID must be an integer' })
  studentId: number;

  @ApiProperty({ description: 'Attendance status', example: true })
  @IsNotEmpty()
  @IsBoolean({ message: 'Present must be a boolean value' })
  present: boolean;

  @ApiProperty({
    description: 'Notes about the attendance',
    example: 'Student was late',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(500, { message: 'Notes must be at most 500 characters long' })
  notes?: string;
}
