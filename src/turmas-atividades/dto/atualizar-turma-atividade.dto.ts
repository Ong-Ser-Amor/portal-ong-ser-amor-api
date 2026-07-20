import { OmitType, PartialType } from '@nestjs/swagger';

import { CriarTurmaAtividadeDto } from './criar-turma-atividade.dto';

export class AtualizarTurmaAtividadeDto extends PartialType(
  OmitType(CriarTurmaAtividadeDto, ['turmaId'] as const),
) {}
