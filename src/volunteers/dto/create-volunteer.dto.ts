import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { EducationStatus, VolunteerType } from '../enums/volunteer.enum';

export class CreateVolunteerDto {
  @ApiProperty({ type: String, example: 'Carlos Santos' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ type: String, example: '12345678900' })
  @IsNotEmpty({ message: 'CPF is required' })
  @Length(11, 11, { message: 'CPF must be exactly 11 characters' })
  cpf: string;

  @ApiProperty({ type: Date, example: '1990-01-01' })
  @IsNotEmpty({ message: 'Birth date is required' })
  @IsDate({ message: 'Birth date must be a valid date' })
  @Type(() => Date)
  birthDate: Date;

  @ApiProperty({ type: String, example: 'Pedagogia' })
  @IsOptional()
  @IsString({ message: 'Academic background must be a string' })
  academicBackground: string | null;

  @ApiProperty({
    enum: EducationStatus,
    example: EducationStatus.COMPLETED,
    required: false,
  })
  @IsOptional()
  @IsEnum(EducationStatus, {
    message: 'Education status must be a valid value',
  })
  educationStatus: EducationStatus | null;

  @ApiProperty({
    enum: VolunteerType,
    example: VolunteerType.TEACHER,
  })
  @IsNotEmpty({ message: 'Volunteer type is required' })
  @IsEnum(VolunteerType, {
    message: 'Volunteer type must be a valid value',
  })
  volunteerType: VolunteerType;
}
