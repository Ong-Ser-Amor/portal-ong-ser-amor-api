import { OmitType, PartialType } from '@nestjs/swagger';

import { CriarTurmaDto } from './criar-turma.dto';

export class AtualizarTurmaDto extends PartialType(
  OmitType(CriarTurmaDto, ['planoCursoId'] as const),
) {}
