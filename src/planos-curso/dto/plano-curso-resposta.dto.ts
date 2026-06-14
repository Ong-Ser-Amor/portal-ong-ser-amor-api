import { PlanoCurso } from '../entities/plano-curso.entity';

export class PlanoCursoRespostaDto {
  id: string;
  nome: string;
  cursoId: string;

  constructor(planoCurso: PlanoCurso) {
    this.id = planoCurso.id;
    this.nome = planoCurso.nome;
    this.cursoId = planoCurso.cursoId;
  }
}
