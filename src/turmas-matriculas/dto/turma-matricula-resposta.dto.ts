import { Beneficiario } from 'src/beneficiarios/entities/beneficiario.entity';
import { TurmaRespostaDto } from 'src/turmas/dto/turma-resposta.dto';

import { TurmaMatricula } from '../entities/turmas-matricula.entity';
import { ResultadoFinalMatricula } from '../enums/resultado-final-matricula.enum';
import { StatusMatricula } from '../enums/status-matricula.enum';

class BeneficiarioResumoRespostaDto {
  id: string;
  nome: string;

  constructor(beneficiario: Beneficiario) {
    this.id = beneficiario.id;
    this.nome = beneficiario.pessoa?.nome ?? 'Aluno sem nome cadastrado';
  }
}

export class TurmaMatriculaRespostaDto {
  id: string;
  status: StatusMatricula;
  resultadoFinal: ResultadoFinalMatricula | null;
  notaFinal: string | null;
  parecerPedagogico: string | null;
  turma?: TurmaRespostaDto;
  beneficiario?: BeneficiarioResumoRespostaDto;

  constructor(matricula: TurmaMatricula) {
    this.id = matricula.id;
    this.status = matricula.status;
    this.resultadoFinal = matricula.resultadoFinal;
    this.notaFinal = matricula.notaFinal;
    this.parecerPedagogico = matricula.parecerPedagogico;

    if (matricula.turma) {
      this.turma = new TurmaRespostaDto(matricula.turma);
    }

    if (matricula.beneficiario) {
      this.beneficiario = new BeneficiarioResumoRespostaDto(
        matricula.beneficiario,
      );
    }
  }
}
