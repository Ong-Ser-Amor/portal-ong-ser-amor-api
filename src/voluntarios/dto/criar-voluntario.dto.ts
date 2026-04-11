import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { StatusFormacao, TipoVoluntario } from '../enums/voluntario.enum';

export class CriarVoluntarioDto {
  // --- Dados referentes à entidade Pessoa ---

  @ApiProperty({ type: String, example: 'Carlos Santos' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser um texto.' })
  nome: string;

  @ApiProperty({ type: String, example: '12345678900' })
  @IsNotEmpty({ message: 'O CPF é obrigatório.' })
  @Length(11, 11, {
    message: 'O CPF deve ter exatamente 11 caracteres (apenas números).',
  })
  cpf: string;

  @ApiProperty({ type: Date, example: '2000-01-01' })
  @IsNotEmpty({ message: 'A data de nascimento é obrigatória.' })
  @IsDate({ message: 'A data de nascimento deve ser uma data válida.' })
  @Type(() => Date)
  dataNascimento: Date;

  // --- Dados específicos da entidade Voluntário ---

  @ApiProperty({ type: String, example: 'Pedagogia' })
  @IsOptional()
  @IsString({ message: 'A formação acadêmica deve ser um texto.' })
  formacaoAcademica: string | null;

  @ApiProperty({
    enum: StatusFormacao,
    example: StatusFormacao.COMPLETO,
    required: false,
  })
  @IsOptional()
  @IsEnum(StatusFormacao, {
    message: 'O status de escolaridade fornecido é inválido.',
  })
  statusFormacao: StatusFormacao | null;

  @ApiProperty({
    enum: TipoVoluntario,
    example: TipoVoluntario.PROFESSOR,
  })
  @IsNotEmpty({ message: 'O tipo de voluntário é obrigatório.' })
  @IsEnum(TipoVoluntario, {
    message: 'O tipo de voluntário fornecido é inválido.',
  })
  tipoVoluntario: TipoVoluntario;
}
