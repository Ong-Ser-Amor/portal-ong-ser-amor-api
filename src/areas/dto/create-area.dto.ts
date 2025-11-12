import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateAreaDto {
  @ApiProperty({ type: String, example: 'Sala de Aula' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ type: Number, example: 1 })
  @IsInt({ message: 'Location ID must be an integer' })
  @IsPositive({ message: 'Location ID must be a positive number' })
  locationId: number;
}
