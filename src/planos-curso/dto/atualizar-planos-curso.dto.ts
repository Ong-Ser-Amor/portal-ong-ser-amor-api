import { OmitType, PartialType } from '@nestjs/swagger';

import { CriarPlanoCursoDto } from './criar-plano-curso.dto';

export class AtualizarPlanoCursoDto extends PartialType(
  OmitType(CriarPlanoCursoDto, ['cursoId'] as const),
) {}
