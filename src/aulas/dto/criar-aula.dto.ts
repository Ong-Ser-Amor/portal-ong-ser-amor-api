import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CriarAulaDto {
  @ApiProperty({
    example: '1',
  })
  @IsString({ message: 'O campo turmaId deve ser uma string' })
  @IsNotEmpty({ message: 'O campo turmaId é obrigatório' })
  turmaId: string;

  @ApiProperty({
    type: Date,
    example: '2026-07-18',
    description: 'Data de realização da aula no formato YYYY-MM-DD',
  })
  @IsNotEmpty({ message: 'O campo data é obrigatório' })
  @IsDate({ message: 'O campo data deve ser uma data válida' })
  @Type(() => Date)
  data: Date;

  @ApiProperty({
    example: 'Primeira aula',
    description: 'Conteúdo programático, tema ou assunto abordado no encontro',
  })
  @IsString({ message: 'O campo tema deve ser uma string' })
  @IsNotEmpty({ message: 'O campo tema é obrigatório' })
  @MinLength(3, {
    message: 'O tema da aula deve conter pelo menos 3 caracteres',
  })
  @MaxLength(255, {
    message: 'O tema da aula deve conter no máximo 255 caracteres',
  })
  tema: string;
}
