import { ApiProperty } from '@nestjs/swagger';

import { Curso } from '../entities/curso.entity';

export class CursoRespostaDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'Informática Básica' })
  nome: string;

  constructor(curso: Curso) {
    this.id = curso.id;
    this.nome = curso.nome;
  }
}
