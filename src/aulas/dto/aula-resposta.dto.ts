import { Aula } from '../entities/aula.entity';
import { StatusAula } from '../enums/status-aula.enum';

export class AulaRespostaDto {
  id: string;
  turmaId: string;
  data: Date;
  tema: string;
  status: StatusAula;

  constructor(aula: Aula) {
    this.id = aula.id;
    this.turmaId = aula.turmaId;
    this.data = aula.data;
    this.tema = aula.tema;
    this.status = aula.status;
  }
}
