import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { TurmaAtividade } from '../entities/turmas-atividade.entity';
import { TipoAtividade } from '../enums/tipo-atividade.enum';

export class TurmaAtividadeRespostaDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: '1' })
  turmaId: string;

  @ApiProperty({ example: 'Exercício de Lógica de Programação' })
  titulo: string;

  @ApiPropertyOptional({ example: 'Criar um algoritmo...' })
  descricao: string | null;

  @ApiProperty({ enum: TipoAtividade, example: TipoAtividade.EXERCICIO })
  tipoAtividade: TipoAtividade;

  @ApiProperty({ example: true })
  valeNota: boolean;

  @ApiPropertyOptional({ example: '10.00', nullable: true })
  notaMaxima: string | null;

  @ApiProperty({ example: '2026-07-15' })
  dataAtribuicao: string;

  @ApiProperty({ example: '2026-07-22' })
  prazoEntrega: string;

  constructor(atividade: TurmaAtividade) {
    this.id = atividade.id;
    this.turmaId = atividade.turmaId;
    this.titulo = atividade.titulo;
    this.descricao = atividade.descricao;
    this.tipoAtividade = atividade.tipoAtividade;
    this.valeNota = atividade.valeNota;
    // Converte o decimal do banco para string ou mantém null
    this.notaMaxima =
      atividade.notaMaxima !== null && atividade.notaMaxima !== undefined
        ? String(atividade.notaMaxima)
        : null;
    this.dataAtribuicao = atividade.dataAtribuicao;
    this.prazoEntrega = atividade.prazoEntrega;
  }
}
