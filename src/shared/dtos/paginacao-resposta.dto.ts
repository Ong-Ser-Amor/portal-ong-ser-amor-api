import { ApiProperty } from '@nestjs/swagger';

import { PaginacaoMetaDto } from './paginacao.dto';

export class PaginacaoRespostaDto<T> {
  @ApiProperty({
    description: 'Metadados da paginação',
    type: PaginacaoMetaDto,
  })
  meta: PaginacaoMetaDto;

  @ApiProperty({
    description: 'Dados paginados',
    type: 'array',
    isArray: true,
  })
  dados: T[];

  constructor(
    dados: T[],
    total: number,
    itensPorPagina: number,
    paginaAtual: number,
  ) {
    const totalPaginas = Math.ceil(total / itensPorPagina);

    this.meta = new PaginacaoMetaDto(
      itensPorPagina,
      total,
      paginaAtual,
      totalPaginas,
    );

    this.dados = dados;
  }
}
