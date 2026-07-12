import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CriarTurmaMatriculaDto {
  @ApiProperty({
    example: '1',
    description: 'Identificador único da turma (bigint no banco de dados)',
  })
  @IsString({ message: 'O campo turmaId deve ser uma string' })
  @IsNotEmpty({ message: 'O campo turmaId é obrigatório' })
  turmaId: string;

  @ApiProperty({
    example: '12',
    description: 'Id do beneficiário (o aluno) que será vinculado à turma',
  })
  @IsString({ message: 'O campo beneficiarioId deve ser uma string' })
  @IsNotEmpty({ message: 'O campo beneficiarioId é obrigatório' })
  beneficiarioId: string;
}
