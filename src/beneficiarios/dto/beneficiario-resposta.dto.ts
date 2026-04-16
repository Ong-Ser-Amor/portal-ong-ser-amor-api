import { Beneficiario } from '../entities/beneficiario.entity';
import {
  EstadoCivil,
  NivelEscolaridade,
  VinculoEmpregaticio,
} from '../enums/beneficiario.enum';

export class BeneficiarioRespostaDto {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: Date;
  familiaId: string;
  nivelEscolaridade: NivelEscolaridade;
  estadoCivil?: EstadoCivil;
  vinculoEmpregaticio?: VinculoEmpregaticio;
  quantidadeFilhos: number | null;

  constructor(beneficiario: Beneficiario) {
    this.id = beneficiario.id;

    // Dados da Pessoa
    this.nome = beneficiario.pessoa?.nome || '';
    this.cpf = beneficiario.pessoa?.cpf || '';
    this.dataNascimento = beneficiario.pessoa?.dataNascimento;

    // Dados específicos do Beneficiário
    this.familiaId = beneficiario.familiaId;
    this.nivelEscolaridade = beneficiario.nivelEscolaridade;
    this.estadoCivil = beneficiario.estadoCivil;
    this.vinculoEmpregaticio = beneficiario.vinculoEmpregaticio;
    this.quantidadeFilhos = beneficiario.quantidadeFilhos;
  }
}
