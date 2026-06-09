import { PartialType } from '@nestjs/swagger';

import { CriarCursoDto } from './criar-curso.dto';

export class AtualizarCursoDto extends PartialType(CriarCursoDto) {}
