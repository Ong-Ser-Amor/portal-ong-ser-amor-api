import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanoCursoRespostaDto } from 'src/planos-curso/dto/plano-curso-resposta.dto';

import { Turma } from '../entities/turma.entity';
import { CriterioAvaliacao } from '../enums/criterio-avaliacao.enum';
import { StatusTurma } from '../enums/status-turma.enum';

export class TurmaResumoDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: '1' })
  planoCursoId: string;

  @ApiProperty({ example: 'Turma de Lógica de Programação' })
  nome: string;

  @ApiPropertyOptional({ type: () => PlanoCursoRespostaDto })
  planoCurso?: PlanoCursoRespostaDto;

  @ApiProperty({ example: 40 })
  cargaHoraria: number;

  @ApiProperty({ example: '2024-01-01' })
  dataInicio: Date;

  @ApiProperty({ example: '2024-12-31' })
  dataFim: Date;

  @ApiProperty({ enum: StatusTurma, example: StatusTurma.EM_ANDAMENTO })
  status: StatusTurma;

  @ApiProperty({
    enum: CriterioAvaliacao,
    example: CriterioAvaliacao.POR_NOTA_PRESENCA,
  })
  criterioAvaliacao: CriterioAvaliacao;

  @ApiPropertyOptional({ example: 75, nullable: true })
  frequenciaMinima?: number | null;

  @ApiPropertyOptional({ example: '6.00', nullable: true })
  notaMinima?: string | null;

  constructor(turma: Turma) {
    this.id = turma.id;
    this.planoCursoId = turma.planoCursoId;
    this.nome = turma.nome;

    if (turma.planoCurso) {
      this.planoCurso = new PlanoCursoRespostaDto(turma.planoCurso);
    }

    this.cargaHoraria = turma.cargaHoraria;
    this.dataInicio = turma.dataInicio;
    this.dataFim = turma.dataFim;
    this.status = turma.status;
    this.criterioAvaliacao = turma.criterioAvaliacao;
    this.frequenciaMinima = turma.frequenciaMinima;
    this.notaMinima = turma.notaMinima;
  }
}
