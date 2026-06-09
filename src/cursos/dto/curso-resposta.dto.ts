import { Curso } from '../entities/curso.entity';

export class CursoRespostaDto {
  id: string;
  nome: string;

  constructor(curso: Curso) {
    this.id = curso.id;
    this.nome = curso.nome;
  }
}
