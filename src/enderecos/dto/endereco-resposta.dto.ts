import { Endereco } from '../entities/endereco.entity';
import { Uf } from '../enums/uf.enum';

export class EnderecoRespostaDto {
  id: string;
  logradouro: string;
  numero: string | null;
  complemento: string | null;
  bairro: string;
  cep: string;
  cidade: string;
  uf: Uf;

  constructor(endereco: Endereco) {
    this.id = endereco.id;
    this.logradouro = endereco.logradouro;
    this.numero = endereco.numero;
    this.complemento = endereco.complemento;
    this.bairro = endereco.bairro;
    this.cep = endereco.cep;
    this.cidade = endereco.cidade;
    this.uf = endereco.uf;
  }
}
