import { TurmaMatricula } from 'src/turmas-matriculas/entities/turmas-matricula.entity';

import { TurmaAtividadeRespostaDto } from './turma-atividade-resposta.dto';
import { TurmaAtividadeEntrega } from '../entities/turma-atividade-entrega.entity';
import { StatusEntrega } from '../enums/status-entrega.enum';

class MatriculaResumoRespostaDto {
  id: string;
  nomeAluno: string;

  constructor(matricula: TurmaMatricula) {
    this.id = matricula.id;
    this.nomeAluno =
      matricula.beneficiario?.pessoa?.nome ?? 'Aluno sem nome cadastrado';
  }
}

export class TurmaAtividadeEntregaRespostaDto {
  id: string;
  atividadeId: string;
  matriculaId: string;
  statusEntrega: StatusEntrega;
  notaObtida: string | null;
  dataEntrega: Date | null;
  observacao: string | null;
  atividade?: TurmaAtividadeRespostaDto;
  matricula?: MatriculaResumoRespostaDto;

  constructor(entrega: TurmaAtividadeEntrega) {
    this.id = entrega.id;
    this.atividadeId = entrega.atividadeId;
    this.matriculaId = entrega.matriculaId;
    this.statusEntrega = entrega.statusEntrega;
    this.notaObtida = entrega.notaObtida ? String(entrega.notaObtida) : null;
    this.dataEntrega = entrega.dataEntrega;
    this.observacao = entrega.observacao;

    if (entrega.atividade) {
      this.atividade = new TurmaAtividadeRespostaDto(entrega.atividade);
    }

    if (entrega.matricula) {
      this.matricula = new MatriculaResumoRespostaDto(entrega.matricula);
    }
  }
}
