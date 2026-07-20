import { TurmaAtividade } from '../entities/turmas-atividade.entity';
import { TipoAtividade } from '../enums/tipo-atividade.enum';

export class TurmaAtividadeRespostaDto {
  id: string;
  turmaId: string;
  titulo: string;
  descricao: string | null;
  tipoAtividade: TipoAtividade;
  valeNota: boolean;
  notaMaxima: string | null;
  dataAtribuicao: Date;
  prazoEntrega: Date;

  constructor(atividade: TurmaAtividade) {
    this.id = atividade.id;
    this.turmaId = atividade.turmaId;
    this.titulo = atividade.titulo;
    this.descricao = atividade.descricao;
    this.tipoAtividade = atividade.tipoAtividade;
    this.valeNota = atividade.valeNota;
    // Converte o decimal do banco para string ou mantém null
    this.notaMaxima = atividade.notaMaxima
      ? String(atividade.notaMaxima)
      : null;
    this.dataAtribuicao = atividade.dataAtribuicao;
    this.prazoEntrega = atividade.prazoEntrega;
  }
}
