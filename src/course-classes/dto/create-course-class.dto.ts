import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCourseClassDto {
  @ApiProperty({ type: Number, example: 1 })
  @IsInt({ message: 'Course ID must be an integer' })
  @IsPositive({ message: 'Course ID must be a positive number' })
  courseId: number;

  @ApiProperty({ type: String, example: 'Programming 2' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ type: Date, format: 'date', example: '2024-01-01' })
  @IsNotEmpty({ message: 'Start date is required' })
  @IsDate({ message: 'Start date must be a valid date' })
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ type: Date, format: 'date', example: '2024-12-31' })
  @IsNotEmpty({ message: 'End date is required' })
  @IsDate({ message: 'End date must be a valid date' })
  @Type(() => Date)
  endDate: Date;
}
