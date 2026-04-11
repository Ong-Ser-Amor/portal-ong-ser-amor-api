import { PartialType } from '@nestjs/swagger';

import { CriarContatoDto } from './criar-contato.dto';

export class AtualizarContatoDto extends PartialType(CriarContatoDto) {}
