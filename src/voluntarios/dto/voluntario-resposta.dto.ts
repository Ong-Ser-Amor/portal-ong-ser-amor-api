import { Voluntario } from '../entities/voluntario.entity';
import { StatusFormacao, TipoVoluntario } from '../enums/voluntario.enum';

export class VoluntarioRespostaDto {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: Date;
  formacaoAcademica: string | null;
  statusFormacao: StatusFormacao | null;
  tipoVoluntario: TipoVoluntario;

  constructor(voluntario: Voluntario) {
    this.id = voluntario.id;
    this.nome = voluntario.pessoa?.nome || '';
    this.cpf = voluntario.pessoa?.cpf || '';
    this.dataNascimento = voluntario.pessoa?.dataNascimento;
    this.formacaoAcademica = voluntario.formacaoAcademica;
    this.statusFormacao = voluntario.statusFormacao;
    this.tipoVoluntario = voluntario.tipoVoluntario;
  }
}
