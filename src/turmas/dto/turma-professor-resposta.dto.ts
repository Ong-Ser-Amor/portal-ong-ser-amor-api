import { TurmaProfessor } from '../entities/turma-professor';

export class TurmaProfessorRespostaDto {
  id: string;
  turmaId: string;
  professorId: string;

  constructor(turmaProfessor: TurmaProfessor) {
    this.id = turmaProfessor.id;
    this.turmaId = turmaProfessor.turmaId;
    this.professorId = turmaProfessor.professorId;
  }
}
