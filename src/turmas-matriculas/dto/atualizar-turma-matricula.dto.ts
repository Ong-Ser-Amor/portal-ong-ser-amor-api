import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

import { CriarTurmaMatriculaDto } from './criar-turma-matricula.dto';
import { ResultadoFinalMatricula } from '../enums/resultado-final-matricula.enum';
import { StatusMatricula } from '../enums/status-matricula.enum';

export class AtualizarTurmaMatriculaDto extends PartialType(
  OmitType(CriarTurmaMatriculaDto, ['turmaId', 'beneficiarioId'] as const),
) {
  @ApiPropertyOptional({
    enum: StatusMatricula,
    example: StatusMatricula.CONCLUIDA,
    description: 'Atualiza a situação atual da matrícula do aluno na turma.',
  })
  @IsOptional()
  @IsEnum(StatusMatricula, {
    message: `O campo status deve ser um dos seguintes valores: ${Object.values(
      StatusMatricula,
    ).join(', ')}`,
  })
  status?: StatusMatricula;

  @ApiPropertyOptional({
    enum: ResultadoFinalMatricula,
    example: ResultadoFinalMatricula.APROVADO,
    description:
      'Veredito pedagógico final do estudante. Deve ser nulo para turmas sem controle.',
  })
  @IsOptional()
  @IsEnum(ResultadoFinalMatricula, {
    message: `O resultado final deve ser um dos seguintes valores: ${Object.values(
      ResultadoFinalMatricula,
    ).join(', ')}`,
  })
  resultadoFinal?: ResultadoFinalMatricula | null;

  @ApiPropertyOptional({
    example: '2550.00',
    description:
      'Nota final do aluno na turma, caso a turma possua critérios de avaliação por nota. Deve ser nulo para turmas sem controle.',
  })
  @IsOptional()
  @IsString({ message: 'A nota final deve ser enviada como texto (string)' })
  @Matches(/^\d{1,5}(\.\d{1,2})?$/, {
    message:
      'A nota final deve ser um número decimal válido com até duas casas decimais separadas por ponto (Ex: 9.50 ou 4200.00)',
  })
  notaFinal?: string | null;

  @ApiPropertyOptional({
    example:
      'Aluno se destacou durante o curso, demonstrando grande interesse e participação ativa nas atividades propostas.',
    description:
      'Espaço livre para parecer pedagógico e observações qualitativas.',
  })
  @IsOptional()
  @IsString({ message: 'O parecer pedagógico deve ser uma string de texto' })
  parecerPedagogico?: string | null;
}
