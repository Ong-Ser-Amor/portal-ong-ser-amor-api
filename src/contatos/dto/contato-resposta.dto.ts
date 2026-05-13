import { Contato } from '../entities/contato.entity';

export class ContatoRespostaDto {
  id: string;
  tipoContato: string;
  valor: string;

  constructor(contato: Contato) {
    this.id = contato.id;
    this.tipoContato = contato.tipoContato;
    this.valor = contato.valor;
  }
}
