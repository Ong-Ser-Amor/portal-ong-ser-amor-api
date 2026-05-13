import { OmitType, PartialType } from '@nestjs/swagger';

import { CriarUsuarioDto } from './criar-usuario.dto';

export class AtualizarUsuarioDto extends PartialType(
  OmitType(CriarUsuarioDto, ['senha'] as const),
) {}
