import { ApiProperty } from '@nestjs/swagger';

export class PaginacaoMetaDto {
  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  paginaAtual: number;

  @ApiProperty({
    description: 'Número de itens por página',
    example: 10,
  })
  itensPorPagina: number;

  @ApiProperty({
    description: 'Total de itens',
    example: 100,
  })
  totalItens: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 10,
  })
  totalPaginas: number;

  constructor(
    paginaAtual: number,
    itensPorPagina: number,
    totalItens: number,
    totalPaginas: number,
  ) {
    this.paginaAtual = paginaAtual;
    this.itensPorPagina = itensPorPagina;
    this.totalItens = totalItens;
    this.totalPaginas = totalPaginas;
  }
}

export class PaginacaoDto<T> {
  @ApiProperty({
    description: 'Metadados da paginação',
    type: PaginacaoMetaDto,
  })
  meta: PaginacaoMetaDto;

  @ApiProperty({
    description: 'Dados paginados',
    isArray: true,
  })
  dados: T[];

  constructor(metaPaginacao: PaginacaoMetaDto, dados: T[]) {
    this.meta = metaPaginacao;
    this.dados = dados;
  }
}
