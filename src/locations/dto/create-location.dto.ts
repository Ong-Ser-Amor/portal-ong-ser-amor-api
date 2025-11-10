import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ type: String, example: 'Sede' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ type: String, example: 'Rua Oceano, 123' })
  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  address: string;
}
