import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsDateAfter } from 'src/utils/decorators/is-date-after.decorator';

import { StatusTurma } from '../enums/status-turma.enum';

export class CriarTurmaDto {
  @ApiProperty({ example: '1' })
  @IsString({ message: 'O campo planoCursoId deve ser uma string' })
  @IsNotEmpty({ message: 'O campo planoCursoId é obrigatório' })
  planoCursoId: string;

  @ApiProperty({ example: 'Turma de Lógica de Programação' })
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome é obrigatório' })
  @MinLength(3, {
    message: 'O nome da turma deve conter pelo menos 3 caracteres',
  })
  @MaxLength(100, {
    message: 'O nome da turma deve conter no máximo 100 caracteres',
  })
  nome: string;

  @ApiProperty({ example: 40 })
  @IsInt({ message: 'A carga horária deve ser um número inteiro' })
  @Min(1, { message: 'A carga horária deve ser de pelo menos 1 hora' })
  @IsNotEmpty({ message: 'O campo carga horária é obrigatório' })
  cargaHoraria: number;

  @ApiProperty({ type: Date, example: '2024-01-01' })
  @IsNotEmpty({ message: 'O campo dataInicio é obrigatório' })
  @IsDate({ message: 'O campo dataInicio deve ser uma data válida' })
  @Type(() => Date)
  dataInicio: Date;

  @ApiProperty({ type: Date, example: '2024-12-31' })
  @IsNotEmpty({ message: 'O campo dataFim é obrigatório' })
  @IsDate({ message: 'O campo dataFim deve ser uma data válida' })
  @Type(() => Date)
  @IsDateAfter('dataInicio', {
    message: 'A data final não pode ser anterior à data de início',
  })
  dataFim: Date;

  @ApiProperty({ enum: StatusTurma, example: StatusTurma.EM_FORMACAO })
  @IsEnum(StatusTurma, {
    message: `O campo status deve ser um dos seguintes valores: ${Object.values(
      StatusTurma,
    ).join(', ')}`,
  })
  status: StatusTurma;
}
