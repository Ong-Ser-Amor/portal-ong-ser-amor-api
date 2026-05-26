import { OmitType, PartialType } from '@nestjs/swagger';

import { CriarFamiliaDto } from './criar-familia.dto';

export class AtualizarFamiliaDto extends PartialType(
  OmitType(CriarFamiliaDto, ['endereco'] as const),
) {}
