import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

import { State } from '../enums/state.enum';

export class CreateAddressDto {
  @ApiProperty({ example: 'Rua das Flores' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  street: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  number: string;

  @ApiPropertyOptional({ example: 'Apto 45', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  complement: string | null;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  neighborhood: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8}$/, { message: 'zipCode must be an 8-digit number' })
  zipCode: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  city: string;

  @ApiProperty({ enum: State, example: State.SP })
  @IsEnum(State, {
    message: `state must be a valid Brazilian state abbreviation`,
  })
  @IsNotEmpty()
  state: State;
}
