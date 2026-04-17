import { OmitType, PartialType } from '@nestjs/swagger';

import { CriarVoluntarioDto } from './criar-voluntario.dto';

export class AtualizarVoluntarioDto extends PartialType(
  OmitType(CriarVoluntarioDto, ['pessoaId'] as const),
) {}
