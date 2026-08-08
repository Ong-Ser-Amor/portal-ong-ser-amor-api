import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Uf } from '../enums/uf.enum';

export class CriarEnderecoDto {
  @ApiProperty({ example: 'Avenida Brasil' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, {
    message: 'O logradouro deve conter pelo menos 3 caracteres',
  })
  @MaxLength(100, {
    message: 'O logradouro deve conter no máximo 100 caracteres',
  })
  logradouro: string;

  @ApiPropertyOptional({ example: '123', required: false })
  @IsString()
  @IsOptional()
  @MinLength(1, {
    message: 'O número deve conter pelo menos 1 caractere',
  })
  @MaxLength(20, {
    message: 'O número deve conter no máximo 20 caracteres',
  })
  numero: string | null;

  @ApiPropertyOptional({ example: 'Apto 45', required: false })
  @IsString()
  @IsOptional()
  @MinLength(3, {
    message: 'O complemento deve conter pelo menos 3 caracteres',
  })
  @MaxLength(50, {
    message: 'O complemento deve conter no máximo 50 caracteres',
  })
  complemento: string | null;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, {
    message: 'O bairro deve conter pelo menos 3 caracteres',
  })
  @MaxLength(80, {
    message: 'O bairro deve conter no máximo 80 caracteres',
  })
  bairro: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8}$/, {
    message: 'O CEP deve conter exatamente 8 dígitos numéricos',
  })
  cep: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, {
    message: 'A cidade deve conter pelo menos 3 caracteres',
  })
  @MaxLength(80, {
    message: 'A cidade deve conter no máximo 80 caracteres',
  })
  cidade: string;

  @ApiProperty({ enum: Uf, example: Uf.SP })
  @IsEnum(Uf, {
    message: `A UF deve ser uma sigla válida de estado brasileiro (ex: SP, RJ)`,
  })
  @IsNotEmpty()
  uf: Uf;
}
