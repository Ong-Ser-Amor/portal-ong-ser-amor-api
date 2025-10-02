import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsInt({ message: 'Course Class ID must be an integer' })
  @IsPositive({ message: 'Course Class ID must be a positive number' })
  courseClassId: number;

  @ApiProperty({ type: Date, example: '2025-10-01' })
  @IsNotEmpty({ message: 'Date is required' })
  @IsDate({ message: 'Date must be a valid date' })
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    type: String,
    example: 'Introduction to Python',
    required: false,
  })
  @IsOptional()
  @MaxLength(255, { message: 'Topic must be at most 255 characters long' })
  @IsString({ message: 'Topic must be a string' })
  topic?: string;
}
