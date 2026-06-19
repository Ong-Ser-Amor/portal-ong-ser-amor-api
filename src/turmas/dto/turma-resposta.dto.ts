import { InternalServerErrorException } from '@nestjs/common';
import { PlanoCursoRespostaDto } from 'src/planos-curso/dto/plano-curso-resposta.dto';
import { Voluntario } from 'src/voluntarios/entities/voluntario.entity';

import { Turma } from '../entities/turma.entity';
import { StatusTurma } from '../enums/status-turma.enum';

class ProfessorResumoRespostaDto {
  id: string;
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
  id: string;
  nome: string;
  planoCurso?: PlanoCursoRespostaDto;
  cargaHoraria: number;
  dataInicio: Date;
  dataFim: Date;
  status: StatusTurma;
  professores?: ProfessorResumoRespostaDto[];

  constructor(turma: Turma) {
    this.id = turma.id;
    this.nome = turma.nome;
    if (turma.planoCurso) {
      this.planoCurso = new PlanoCursoRespostaDto(turma.planoCurso);
    }
    this.cargaHoraria = turma.cargaHoraria;
    this.dataInicio = turma.dataInicio;
    this.dataFim = turma.dataFim;
    this.status = turma.status;

    if (turma.turmasProfessores) {
      this.professores = turma.turmasProfessores.map(
        (tp) => new ProfessorResumoRespostaDto(tp.professor),
      );
    }
  }
}
