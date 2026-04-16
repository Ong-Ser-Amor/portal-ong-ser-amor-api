import { OmitType, PartialType } from '@nestjs/swagger';

import { CriarBeneficiarioDto } from './criar-beneficiario.dto';

export class AtualizarBeneficiarioDto extends PartialType(
  OmitType(CriarBeneficiarioDto, ['pessoaId'] as const),
) {}
