import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsDateAfter } from 'src/shared/decorators/is-date-after.decorator';
import { IsDateOnly } from 'src/shared/decorators/is-date-only.decorator';

import { TipoAtividade } from '../enums/tipo-atividade.enum';

export class CriarTurmaAtividadeDto {
  @ApiProperty({ example: '1' })
  @IsString({ message: 'O campo turmaId deve ser uma string' })
  @IsNotEmpty({ message: 'O campo turmaId é obrigatório' })
  turmaId: string;

  @ApiProperty({ example: 'Exercício de Lógica de Programação' })
  @IsString({ message: 'O campo título deve ser uma string' })
  @IsNotEmpty({ message: 'O campo título é obrigatório' })
  @MinLength(3, {
    message: 'O título da atividade deve conter pelo menos 3 caracteres',
  })
  @MaxLength(150, {
    message: 'O título da atividade deve conter no máximo 150 caracteres',
  })
  titulo: string;

  @ApiPropertyOptional({
    example:
      'Criar um algoritimo que some dois números inteiros e retorne o resultado.',
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string' })
  descricao?: string;

  @ApiProperty({ enum: TipoAtividade, example: TipoAtividade.EXERCICIO })
  @IsEnum(TipoAtividade, {
    message: `O tipo de atividade deve ser um dos seguintes valores: ${Object.values(
      TipoAtividade,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'O campo tipo de atividade é obrigatório' })
  tipoAtividade: TipoAtividade;

  @ApiProperty({
    example: true,
    description: `Indica se a atividade vale nota ou pontuação.
    ATENÇÃO: Só pode ser 'true' se o critério de avaliação da turma correspondente for 'POR_NOTA_PRESENCA'.
    Para turmas com critérios 'SEM_CONTROLE', 'POR_PARTICIPACAO' ou 'QUALITATIVA', envie obrigatoriamente como 'false'.`,
  })
  @IsBoolean({ message: 'O campo valeNota deve ser um booleano' })
  @IsNotEmpty({ message: 'O campo valeNota é obrigatório' })
  valeNota: boolean;

  @ApiPropertyOptional({
    example: '10.00',
    description: `Nota ou XP máximo da atividade. Aceita até 5 dígitos antes da vírgula e 2 decimais (precisão 7,2).
    REGRAS DE NEGÓCIO:
    - Obrigatório se 'valeNota' for 'true' (exige critério 'POR_NOTA_PRESENCA' na turma).
    - Deve ser nulo (não enviado) se 'valeNota' for 'false' ou se a turma possuir critérios que não avaliam notas numéricas.`,
  })
  @IsOptional()
  @IsString({ message: 'A nota máxima deve ser enviada como texto (string)' })
  @Matches(/^\d{1,5}(\.\d{1,2})?$/, {
    message:
      'A nota máxima deve ser um número decimal válido com até duas casas decimais separadas por ponto (Ex: 10.00 ou 1500.50)',
  })
  notaMaxima?: string;

  @ApiProperty({
    type: String,
    example: '2026-07-15',
    description: 'Data de atribuição da atividade no formato YYYY-MM-DD',
  })
  @IsNotEmpty({ message: 'O campo dataAtribuicao é obrigatório' })
  @IsDateOnly({
    message:
      'O campo dataAtribuicao deve ser uma data válida no formato YYYY-MM-DD',
  })
  dataAtribuicao: string;

  @ApiProperty({
    type: String,
    example: '2026-07-22',
    description: 'Prazo limite de entrega no formato YYYY-MM-DD',
  })
  @IsNotEmpty({ message: 'O campo prazoEntrega é obrigatório' })
  @IsDateOnly({
    message:
      'O campo prazoEntrega deve ser uma data válida no formato YYYY-MM-DD',
  })
  @IsDateAfter('dataAtribuicao', {
    message:
      'O prazo de entrega não pode ser anterior à data de atribuição da atividade',
  })
  prazoEntrega: string;
}
