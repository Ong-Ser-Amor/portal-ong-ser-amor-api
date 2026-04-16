// src/pessoas/interfaces/criar-pessoa-dados.interface.ts
export interface CriarPessoaDados {
  nome: string;
  cpf: string;
  dataNascimento: Date;
  podeSairSozinho?: boolean;
  responsavelId?: string;
}
