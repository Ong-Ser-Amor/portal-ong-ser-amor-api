import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

import { StatusFormacao, TipoVoluntario } from '../enums/voluntario.enum';

export class CriarVoluntarioDto {
  @ApiProperty({
    example: 'Carlos Santos',
    description:
      'Nome completo da pessoa. Obrigatório ao cadastrar nova pessoa. Não deve ser informado se pessoaId for fornecido.',
    required: false,
  })
  @ValidateIf((dto: CriarVoluntarioDto) => !dto.pessoaId)
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  @ValidateIf((dto: CriarVoluntarioDto) => Boolean(dto.pessoaId))
  @IsEmpty({
    message: 'Não é permitido enviar o campo nome quando pessoaId é informado.',
  })
  nome?: string;

  @ApiProperty({
    type: String,
    example: '12345678900',
    description:
      'CPF com 11 dígitos numéricos. Obrigatório ao cadastrar nova pessoa. Não deve ser informado se pessoaId for fornecido.',
    required: false,
  })
  @ValidateIf((dto: CriarVoluntarioDto) => !dto.pessoaId)
  @IsString({ message: 'O campo cpf deve ser uma string' })
  @IsNotEmpty({ message: 'O campo cpf não pode ser vazio' })
  @Length(11, 11, {
    message: 'O campo cpf deve ter exatamente 11 caracteres.',
  })
  @Matches(/^\d+$/, {
    message: 'O campo cpf deve conter apenas números.',
  })
  @ValidateIf((dto: CriarVoluntarioDto) => Boolean(dto.pessoaId))
  @IsEmpty({
    message: 'Não é permitido enviar o campo cpf quando pessoaId é informado.',
  })
  cpf?: string;

  @ApiProperty({
    type: Date,
    example: '2000-01-01',
    description:
      'Data de nascimento. Obrigatória ao cadastrar nova pessoa. Não deve ser informada se pessoaId for fornecido.',
    required: false,
  })
  @ValidateIf((dto: CriarVoluntarioDto) => !dto.pessoaId)
  @IsDate({ message: 'O campo dataNascimento deve ser uma data válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'O campo dataNascimento não pode ser vazio' })
  @ValidateIf((dto: CriarVoluntarioDto) => Boolean(dto.pessoaId))
  @IsEmpty({
    message:
      'Não é permitido enviar o campo dataNascimento quando pessoaId é informado.',
  })
  dataNascimento?: Date;

  @ApiProperty({
    description: 'ID da pessoa, caso ela já possua cadastro no sistema.',
    example: '123456',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O campo pessoaId deve ser uma string' })
  pessoaId?: string;

  // --- Dados específicos da entidade Voluntário ---

  @ApiProperty({ type: String, example: 'Pedagogia' })
  @IsOptional()
  @IsString({ message: 'O campo formacaoAcademica deve ser uma string' })
  formacaoAcademica: string | null;

  @ApiProperty({
    enum: StatusFormacao,
    example: StatusFormacao.COMPLETO,
    required: false,
  })
  @IsOptional()
  @IsEnum(StatusFormacao, {
    message: 'O campo statusFormacao deve ser um valor válido',
  })
  statusFormacao: StatusFormacao | null;

  @ApiProperty({
    enum: TipoVoluntario,
    example: TipoVoluntario.PROFESSOR,
  })
  @IsNotEmpty({ message: 'O campo tipoVoluntario não pode ser vazio' })
  @IsEnum(TipoVoluntario, {
    message: 'O campo tipoVoluntario deve ser um valor válido',
  })
  tipoVoluntario: TipoVoluntario;
}
