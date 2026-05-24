import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CriarContatoDto } from 'src/contatos/dto/criar-contato.dto';
import { CriarFamiliaDto } from 'src/familias/dto/criar-familia.dto';

import {
  EstadoCivil,
  NivelEscolaridade,
  VinculoEmpregaticio,
} from '../enums/beneficiario.enum';

export class ContatoAninhadoDto extends OmitType(CriarContatoDto, [
  'pessoaId',
] as const) {}

export class CriarBeneficiarioDto {
  // --- Dados referentes à entidade Pessoa ---

  @ApiProperty({
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
  @Length(11, 11, {
    message: 'O campo cpf deve ter exatamente 11 caracteres.',
  })
  @Matches(/^\d+$/, {
    message: 'O campo cpf deve conter apenas números.',
  })
  cpf?: string;

  @ApiProperty({ type: Date, example: '1990-01-01' })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsDate({ message: 'O campo dataNascimento deve ser uma data válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'O campo dataNascimento não pode ser vazio' })
  dataNascimento?: Date;

  @ApiProperty({ example: false })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsOptional()
  @IsBoolean({ message: 'O campo emancipado deve ser booleano' })
  emancipado?: boolean;

  @ApiProperty({ example: true })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsOptional()
  @IsBoolean({ message: 'O campo podeSairSozinho deve ser booleano' })
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

  @ApiProperty({
    description: 'ID da família (se já existir)',
    example: '789012',
  })
  @IsOptional()
  @IsString({ message: 'O campo familiaId deve ser uma string' })
  familiaId?: string;

  @ApiProperty({
    description: 'Dados para criar uma nova família',
    type: CriarFamiliaDto,
  })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.familiaId)
  @IsNotEmpty({
    message:
      'É obrigatório informar o familiaId ou os dados de uma nova familia.',
  })
  @ValidateNested()
  @Type(() => CriarFamiliaDto)
  novaFamilia?: CriarFamiliaDto;

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
  @IsOptional()
  estadoCivil?: EstadoCivil;

  @ApiProperty({
    enum: VinculoEmpregaticio,
    example: VinculoEmpregaticio.DESEMPREGADO,
  })
  @IsOptional()
  @IsEnum(VinculoEmpregaticio, {
    message: 'O campo vinculoEmpregaticio deve ser um valor válido',
  })
  vinculoEmpregaticio?: VinculoEmpregaticio;

  @ApiProperty({ type: Number, example: 2 })
  @IsOptional()
  @IsInt({ message: 'A quantidade de filhos deve ser um número inteiro.' })
  @Min(0, { message: 'A quantidade de filhos não pode ser negativa.' })
  quantidadeFilhos?: number;

  @ApiProperty({ type: [ContatoAninhadoDto], required: false })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContatoAninhadoDto)
  contatos?: ContatoAninhadoDto[];
}
