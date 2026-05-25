import { OmitType, PartialType } from '@nestjs/swagger';

import { CriarFamiliaDto } from './criar-familia.dto';

export class UpdateFamiliaDto extends PartialType(
  OmitType(CriarFamiliaDto, ['enderecoId', 'novoEndereco'] as const),
) {}
