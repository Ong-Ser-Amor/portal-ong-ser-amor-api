import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AttendanceItemDto {
  @ApiProperty({
    description: 'Student ID',
    example: 1,
  })
  @IsInt()
  studentId: number;

  @ApiProperty({
    description: 'Indicates whether the student was present',
    example: true,
  })
  @IsBoolean()
  present: boolean;

  @ApiProperty({
    description: 'Notes about the attendance or absence',
    example: 'Arrived late',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({
    description: 'List of attendance records to be created/updated',
    type: [AttendanceItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AttendanceItemDto)
  attendances: AttendanceItemDto[];
}
