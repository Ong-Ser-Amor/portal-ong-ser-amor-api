import { PartialType } from '@nestjs/swagger';

import { CriarPlanoCursoDto } from './criar-plano-curso.dto';

export class AtualizarPlanoCursoDto extends PartialType(CriarPlanoCursoDto) {}
