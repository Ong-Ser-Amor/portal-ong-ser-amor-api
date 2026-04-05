import { PartialType } from '@nestjs/swagger';

import { CriarEnderecoDto } from './criar-endereco.dto';

export class UpdateEnderecoDto extends PartialType(CriarEnderecoDto) {}
