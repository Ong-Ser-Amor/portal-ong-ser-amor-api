import { PartialType } from '@nestjs/swagger';

import { CriarFamiliaDto } from './criar-familia.dto';

export class UpdateFamiliaDto extends PartialType(CriarFamiliaDto) {}
