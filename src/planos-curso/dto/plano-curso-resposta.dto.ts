import { PlanosCurso } from '../entities/planos-curso.entity';

export class PlanoCursoRespostaDto {
  id: string;
  nome: string;
  cursoId: string;

  constructor(planoCurso: PlanosCurso) {
    this.id = planoCurso.id;
    this.nome = planoCurso.nome;
    this.cursoId = planoCurso.cursoId;
  }
}
