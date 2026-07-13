import { TurmaMatricula } from 'src/turmas-matriculas/entities/turmas-matricula.entity';

import { Chamada } from '../entities/chamada.entity';
import { MotivoJustificativa } from '../enums/motivo-justificativa.enum';

class MatriculaResumoRespostaDto {
  id: string;
  beneficiarioId: string;
  nomeAluno: string;

  constructor(matricula: TurmaMatricula) {
    this.id = matricula.id;
    this.beneficiarioId = matricula.beneficiarioId;
    this.nomeAluno =
      matricula.beneficiario?.pessoa?.nome ?? 'Aluno sem nome cadastrado';
  }
}

export class ChamadaRespostaDto {
  id: string;
  aulaId: string;
  matriculaId: string;
  presente: boolean;
  faltaJustificada: boolean;
  motivoJustificativa: MotivoJustificativa | null;
  observacao: string | null;
  matricula?: MatriculaResumoRespostaDto;

  constructor(chamada: Chamada) {
    this.id = chamada.id;
    this.aulaId = chamada.aulaId;
    this.matriculaId = chamada.matriculaId;
    this.presente = chamada.presente;
    this.faltaJustificada = chamada.faltaJustificada;
    this.motivoJustificativa = chamada.motivoJustificativa;
    this.observacao = chamada.observacao;

    if (chamada.matricula) {
      this.matricula = new MatriculaResumoRespostaDto(chamada.matricula);
    }
  }
}
