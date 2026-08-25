import { InternalServerErrorException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanoCursoRespostaDto } from 'src/planos-curso/dto/plano-curso-resposta.dto';
import { Voluntario } from 'src/voluntarios/entities/voluntario.entity';

import { Turma } from '../entities/turma.entity';
import { CriterioAvaliacao } from '../enums/criterio-avaliacao.enum';
import { StatusTurma } from '../enums/status-turma.enum';

class ProfessorResumoRespostaDto {
  id: string;

  @ApiProperty({ example: 'Carlos Santos' })
  nome: string;

  constructor(voluntario: Voluntario) {
    if (!voluntario.pessoa) {
      throw new InternalServerErrorException(
        'Erro de integridade de dados: Relacionamento de Pessoa/Professor não foi carregado na consulta de Turmas.',
      );
    }

    this.id = voluntario.id;
    this.nome = voluntario.pessoa.nome;
  }
}

export class TurmaRespostaDto {
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

  @ApiProperty({ example: '2026-02-01' })
  dataInicio: string;

  @ApiProperty({ example: '2026-06-30' })
  dataFim: string;

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

  @ApiPropertyOptional({ type: () => [ProfessorResumoRespostaDto] })
  professores?: ProfessorResumoRespostaDto[];

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

    if (turma.turmasProfessores) {
      this.professores = turma.turmasProfessores.map(
        (turmaProfessor) =>
          new ProfessorResumoRespostaDto(turmaProfessor.professor),
      );
    }
  }
}
