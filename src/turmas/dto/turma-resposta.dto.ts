import { Turma } from '../entities/turma.entity';
import { StatusTurma } from '../enums/status-turma.enum';

export class TurmaRespostaDto {
  id: string;
  nome: string;
  cargaHoraria: number;
  dataInicio: Date;
  dataFim: Date;
  status: StatusTurma;
  planoCursoId: string;

  constructor(turma: Turma) {
    this.id = turma.id;
    this.nome = turma.nome;
    this.cargaHoraria = turma.cargaHoraria;
    this.dataInicio = turma.dataInicio;
    this.dataFim = turma.dataFim;
    this.status = turma.status;
    this.planoCursoId = turma.planoCursoId;
  }
}
