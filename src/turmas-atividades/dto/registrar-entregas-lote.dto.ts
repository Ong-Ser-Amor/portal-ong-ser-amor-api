import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

import { StatusEntrega } from '../enums/status-entrega.enum';

export class EntregaAtividadeDto {
  @ApiProperty({
    example: '1',
    description:
      'ID do registro da entrega na tabela turmas_atividades_entregas',
  })
  @IsString({ message: 'O campo entregaId deve ser uma string' })
  @IsNotEmpty({ message: 'O campo entregaId é obrigatório' })
  entregaId: string;

  @ApiProperty({ enum: StatusEntrega, example: StatusEntrega.ENTREGUE })
  @IsEnum(StatusEntrega, {
    message: `O status da entrega deve ser um dos seguintes valores: ${Object.values(
      StatusEntrega,
    ).join(', ')}`,
  })
  @IsNotEmpty({ message: 'O campo statusEntrega é obrigatório' })
  statusEntrega: StatusEntrega;

  @ApiPropertyOptional({
    example: '8.50',
    description:
      'Nota ou XP obtido pelo aluno. Aceita até 5 dígitos inteiros e 2 decimais.',
  })
  @IsOptional()
  @IsString({ message: 'A nota obtida deve ser enviada como texto (string)' })
  @Matches(/^\d{1,5}(\.\d{1,2})?$/, {
    message:
      'A nota obtida deve ser um número decimal válido com até duas casas decimais separadas por ponto (Ex: 9.50 ou 1200.00)',
  })
  notaObtida?: string;

  @ApiPropertyOptional({
    example: 'Entregou o projeto completo com excelente código.',
  })
  @IsOptional()
  @IsString({ message: 'A observação deve ser uma string' })
  observacao?: string;
}

export class RegistrarEntregasLoteDto {
  @ApiProperty({
    type: [EntregaAtividadeDto],
    description:
      'Lista contendo os lançamentos de notas e status de cada aluno.',
  })
  @IsArray({ message: 'O campo entregas deve ser uma lista (array)' })
  @IsNotEmpty({ message: 'A lista de entregas não pode estar vazia' })
  @ValidateNested({ each: true })
  @Type(() => EntregaAtividadeDto)
  entregas: EntregaAtividadeDto[];
}
