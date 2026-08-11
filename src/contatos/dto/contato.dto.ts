import { ApiProperty } from '@nestjs/swagger';

import { Contato } from '../entities/contato.entity';

export class ContatoDto {
  @ApiProperty({ example: '123' })
  id: string;

  @ApiProperty({ example: 'CELULAR' })
  tipoContato: string;

  @ApiProperty({ example: '11999999999' })
  valor: string;

  @ApiProperty({ example: true, required: false })
  ehPrincipal?: boolean;

  constructor(contato: Contato & { ehPrincipal?: boolean }) {
    this.id = contato.id;
    this.tipoContato = contato.tipoContato;
    this.valor = contato.valor;
    if (contato.ehPrincipal !== undefined) {
      this.ehPrincipal = contato.ehPrincipal;
    }
  }
}
