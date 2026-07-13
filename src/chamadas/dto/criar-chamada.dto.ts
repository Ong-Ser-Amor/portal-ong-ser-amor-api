import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { MotivoJustificativa } from '../enums/motivo-justificativa.enum';

export class RegistroPresencaDto {
  @ApiProperty({
    example: '5',
    description:
      'ID do registro de matrícula do beneficiário na turma (bigint)',
  })
  @IsString({ message: 'O campo matriculaId deve ser uma string' })
  @IsNotEmpty({ message: 'O campo matriculaId é obrigatório' })
  matriculaId: string;

  @ApiProperty({
    example: true,
    description:
      'Indica a presença do aluno. Use true para Presença e false para Falta.',
  })
  @IsBoolean({
    message: 'O campo presente deve ser um valor booleano (true ou false)',
  })
  @IsNotEmpty({ message: 'O campo presente é obrigatório' })
  presente: boolean;

  @ApiPropertyOptional({
    example: false,
    description:
      'Informa se a ausência do beneficiário possui justificativa comprovada.',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'O campo faltaJustificada deve ser um valor booleano' })
  faltaJustificada?: boolean;

  @ApiPropertyOptional({
    enum: MotivoJustificativa,
    example: MotivoJustificativa.SAUDE,
    description:
      'Categoria do motivo da falta. Deve ser preenchido apenas se o aluno faltou e justificou.',
  })
  @IsOptional()
  @IsEnum(MotivoJustificativa, {
    message: `O motivo da justificativa deve ser um dos seguintes valores: ${Object.values(
      MotivoJustificativa,
    ).join(', ')}`,
  })
  motivoJustificativa?: MotivoJustificativa;

  @ApiPropertyOptional({
    example: 'Apresentou atestado médico assinado do posto de saúde.',
    description:
      'Anotações pedagógicas, justificativas textuais ou observações de comportamento do dia.',
  })
  @IsOptional()
  @IsString({ message: 'A observação deve ser uma string de texto' })
  @MaxLength(255, {
    message: 'A observação deve conter no máximo 255 caracteres',
  })
  observacao?: string;
}

export class CriarChamadaLoteDto {
  @ApiProperty({
    example: '15',
    description:
      'Identificador único da aula à qual este lote de chamadas pertence (bigint)',
  })
  @IsString({ message: 'O campo aulaId deve ser uma string' })
  @IsNotEmpty({ message: 'O campo aulaId é obrigatório' })
  aulaId: string;

  @ApiProperty({
    type: [RegistroPresencaDto],
    description:
      'Lista contendo a marcação de presença/falta de cada aluno matriculado na turma.',
  })
  @IsArray({ message: 'O campo registros deve ser uma lista (array)' })
  @IsNotEmpty({ message: 'A lista de registros de chamada é obrigatória' })
  @ValidateNested({ each: true })
  @Type(() => RegistroPresencaDto)
  registros: RegistroPresencaDto[];
}
