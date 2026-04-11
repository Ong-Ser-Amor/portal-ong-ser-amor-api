import { PartialType } from '@nestjs/swagger';

import { CriarVoluntarioDto } from './criar-voluntario.dto';

export class AtualizarVoluntarioDto extends PartialType(CriarVoluntarioDto) {}
