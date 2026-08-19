import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CursoRespostaDto } from 'src/cursos/dto/curso-resposta.dto';

import { PlanoCurso } from '../entities/plano-curso.entity';

export class PlanoCursoRespostaDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Plano Básico de Informática' })
  nome: string;

  @ApiProperty({ example: '1' })
  cursoId: string;

  @ApiPropertyOptional({ type: () => CursoRespostaDto })
  curso?: CursoRespostaDto;

  constructor(planoCurso: PlanoCurso) {
    this.id = planoCurso.id;
    this.nome = planoCurso.nome;
    this.cursoId = planoCurso.cursoId;

    if (planoCurso.curso) {
      this.curso = new CursoRespostaDto(planoCurso.curso);
    }
  }
}
