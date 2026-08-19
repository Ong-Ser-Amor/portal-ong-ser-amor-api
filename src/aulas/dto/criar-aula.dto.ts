import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { IsDateOnly } from 'src/shared/decorators/is-date-only.decorator';

export class CriarAulaDto {
  @ApiProperty({
    example: '1',
  })
  @IsString({ message: 'O campo turmaId deve ser uma string' })
  @IsNotEmpty({ message: 'O campo turmaId é obrigatório' })
  turmaId: string;

  @ApiProperty({
    type: String,
    example: '2026-09-26',
    description: 'Data de realização da aula no formato YYYY-MM-DD',
  })
  @IsNotEmpty({ message: 'O campo data é obrigatório' })
  @IsDateOnly({
    message: 'O campo data deve ser uma data válida no formato YYYY-MM-DD',
  })
  data: string;

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
