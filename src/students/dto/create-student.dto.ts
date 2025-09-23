import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ type: String, example: 'Carlos Santos' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ type: Date, format: 'date', example: '2000-01-01' })
  @IsNotEmpty({ message: 'Birth date is required' })
  @IsDate({ message: 'Birth date must be a valid date' })
  @Type(() => Date)
  birthDate: Date;
}
