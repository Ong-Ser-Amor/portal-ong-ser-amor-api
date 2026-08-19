import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsDateAfter } from 'src/shared/decorators/is-date-after.decorator';
import { IsDateOnly } from 'src/shared/decorators/is-date-only.decorator';

import { CriterioAvaliacao } from '../enums/criterio-avaliacao.enum';
import { StatusTurma } from '../enums/status-turma.enum';

export class CriarTurmaDto {
  @ApiProperty({ example: '1' })
  @IsString({ message: 'O campo planoCursoId deve ser uma string' })
  @IsNotEmpty({ message: 'O campo planoCursoId é obrigatório' })
  planoCursoId: string;

  @ApiProperty({ example: 'Turma de Lógica de Programação' })
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  @MinLength(3, {
    message: 'O nome da turma deve conter pelo menos 3 caracteres',
  })
  @MaxLength(100, {
    message: 'O nome da turma deve conter no máximo 100 caracteres',
  })
  nome: string;

  @ApiProperty({ example: 40 })
  @IsInt({ message: 'A carga horária deve ser um número inteiro' })
  @Min(1, { message: 'A carga horária deve ser de pelo menos 1 hora' })
  @IsNotEmpty({ message: 'O campo carga horária é obrigatório' })
  cargaHoraria: number;

  @ApiProperty({
    type: String,
    example: '2026-02-01',
    description: 'Data de início da turma no formato YYYY-MM-DD',
  })
  @IsNotEmpty({ message: 'O campo dataInicio é obrigatório' })
  @IsDateOnly({
    message:
      'O campo dataInicio deve ser uma data válida no formato YYYY-MM-DD',
  })
  dataInicio: string;

  @ApiProperty({
    type: String,
    example: '2026-06-30',
    description: 'Data de encerramento da turma no formato YYYY-MM-DD',
  })
  @IsNotEmpty({ message: 'O campo dataFim é obrigatório' })
  @IsDateOnly({
    message: 'O campo dataFim deve ser uma data válida no formato YYYY-MM-DD',
  })
  @IsDateAfter('dataInicio', {
    message: 'A data final não pode ser anterior à data de início',
  })
  dataFim: string;

  @ApiProperty({ enum: StatusTurma, example: StatusTurma.EM_FORMACAO })
  @IsEnum(StatusTurma, {
    message: `O campo status deve ser um dos seguintes valores: ${Object.values(
      StatusTurma,
    ).join(', ')}`,
  })
  status: StatusTurma;

  @ApiProperty({
    enum: CriterioAvaliacao,
    example: CriterioAvaliacao.POR_NOTA_PRESENCA,
  })
  @IsEnum(CriterioAvaliacao, {
    message: `O critério de avaliação deve ser um dos seguintes valores: ${Object.values(
      CriterioAvaliacao,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'O campo critério de avaliação é obrigatório' })
  criterioAvaliacao: CriterioAvaliacao;

  @ApiPropertyOptional({
    example: 75,
    description: 'Porcentagem de presença mínima (0 a 100)',
  })
  @IsOptional()
  @IsInt({ message: 'A frequência mínima deve ser um número inteiro' })
  @Min(0, { message: 'A frequência mínima não pode ser menor que 0%' })
  @Max(100, { message: 'A frequência mínima não pode ser maior que 100%' })
  frequenciaMinima?: number;

  @ApiPropertyOptional({
    example: '6.00',
    description:
      'Nota ou XP mínimo de aprovação. Aceita até 5 dígitos antes da vírgula e 2 decimais.',
  })
  @IsOptional()
  @IsString({ message: 'A nota mínima deve ser enviada como texto (string)' })
  @Matches(/^\d{1,5}(\.\d{1,2})?$/, {
    message:
      'A nota mínima deve ser um número decimal válido com até duas casas decimais separadas por ponto (Ex: 6.00 ou 2500.00)',
  })
  notaMinima?: string;
}
