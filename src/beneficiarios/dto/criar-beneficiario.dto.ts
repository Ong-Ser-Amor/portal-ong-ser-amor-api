import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

import {
  EstadoCivil,
  NivelEscolaridade,
  VinculoEmpregaticio,
} from '../enums/beneficiario.enum';

export class CriarBeneficiarioDto {
  // --- Dados referentes à entidade Pessoa ---

  @ApiProperty({
    description: 'Nome do beneficiário',
    example: 'João da Silva',
  })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  nome?: string;

  @ApiProperty({
    type: String,
    example: '12345678900',
  })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsString({ message: 'O campo cpf deve ser uma string' })
  @IsNotEmpty({ message: 'O campo cpf não pode ser vazio' })
  cpf?: string;

  @ApiProperty({ type: Date, example: '1990-01-01' })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsDate({ message: 'O campo dataNascimento deve ser uma data válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'O campo dataNascimento não pode ser vazio' })
  dataNascimento?: Date;

  @ApiProperty({ example: true })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsOptional()
  @IsBoolean()
  podeSairSozinho?: boolean;

  @ApiProperty({
    example: '10',
    description: 'ID da pessoa responsável',
  })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsOptional()
  @IsString()
  responsavelId?: string;

  // --- Dados específicos da entidade Beneficiário ---

  @ApiProperty({
    description: 'ID da pessoa, caso ela já possua cadastro no sistema.',
    example: '123456',
  })
  @IsOptional()
  @IsString({ message: 'O campo pessoaId deve ser uma string' })
  pessoaId?: string;

  @ApiProperty({ description: 'ID da família', example: '789012' })
  @IsNotEmpty({ message: 'O campo familiaId é obrigatório' })
  @IsString({ message: 'O campo familiaId deve ser uma string' })
  familiaId: string;

  @ApiProperty({
    enum: NivelEscolaridade,
    example: NivelEscolaridade.ENSINO_FUNDAMENTAL_COMPLETO,
  })
  @IsEnum(NivelEscolaridade, {
    message: 'O campo nivelEscolaridade deve ser um valor válido',
  })
  @IsNotEmpty({ message: 'O campo nivelEscolaridade não pode ser vazio' })
  nivelEscolaridade: NivelEscolaridade;

  @ApiProperty({
    enum: EstadoCivil,
    example: EstadoCivil.SOLTEIRO,
  })
  @IsEnum(EstadoCivil, {
    message: 'O campo estadoCivil deve ser um valor válido',
  })
  @Optional()
  estadoCivil?: EstadoCivil;

  @ApiProperty({
    enum: VinculoEmpregaticio,
    example: VinculoEmpregaticio.DESEMPREGADO,
  })
  @IsOptional()
  @IsEnum(VinculoEmpregaticio, {
    message: 'O campo vinculoEmpregaticio deve ser um valor válido',
  })
  @Optional()
  vinculoEmpregaticio?: VinculoEmpregaticio;

  @ApiProperty({ type: Number, example: 2 })
  @IsOptional()
  @IsInt({ message: 'A quantidade de filhos deve ser um número inteiro.' })
  @Min(0, { message: 'A quantidade de filhos não pode ser negativa.' })
  quantidadeFilhos?: number;
}
