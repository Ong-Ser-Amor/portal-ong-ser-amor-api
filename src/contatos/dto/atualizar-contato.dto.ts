import { OmitType, PartialType } from '@nestjs/swagger';

import { CriarContatoDto } from './criar-contato.dto';

export class AtualizarContatoDto extends PartialType(
  OmitType(CriarContatoDto, ['pessoaId'] as const),
) {}
