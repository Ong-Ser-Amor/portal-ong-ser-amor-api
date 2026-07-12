import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { CriarAulaDto } from './criar-aula.dto';
import { StatusAula } from '../enums/status-aula.enum';

export class AtualizarAulaDto extends PartialType(
  OmitType(CriarAulaDto, ['turmaId'] as const),
) {
  @ApiPropertyOptional({
    enum: StatusAula,
    example: StatusAula.REALIZADA,
    description: 'Atualiza a situação atual da aula no diário de classe.',
  })
  @IsOptional()
  @IsEnum(StatusAula, {
    message: `O campo status deve ser um dos seguintes valores: ${Object.values(
      StatusAula,
    ).join(', ')}`,
  })
  status?: StatusAula;
}
