import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmpty,
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
    description:
      'Nome completo da pessoa. Obrigatório ao cadastrar nova pessoa. Não deve ser informado se pessoaId for fornecido.',
    required: false,
  })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsString({ message: 'O campo nome deve ser uma string' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  @ValidateIf((dto: CriarBeneficiarioDto) => Boolean(dto.pessoaId))
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
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsString({ message: 'O campo cpf deve ser uma string' })
  @IsNotEmpty({ message: 'O campo cpf não pode ser vazio' })
  @Length(11, 11, {
    message: 'O campo cpf deve ter exatamente 11 caracteres.',
  })
  @Matches(/^\d+$/, {
    message: 'O campo cpf deve conter apenas números.',
  })
  @ValidateIf((dto: CriarBeneficiarioDto) => Boolean(dto.pessoaId))
  @IsEmpty({
    message: 'Não é permitido enviar o campo cpf quando pessoaId é informado.',
  })
  cpf?: string;

  @ApiProperty({
    type: Date,
    example: '1990-01-01',
    description:
      'Data de nascimento. Obrigatória ao cadastrar nova pessoa. Não deve ser informada se pessoaId for fornecido.',
    required: false,
  })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsDate({ message: 'O campo dataNascimento deve ser uma data válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'O campo dataNascimento não pode ser vazio' })
  @ValidateIf((dto: CriarBeneficiarioDto) => Boolean(dto.pessoaId))
  @IsEmpty({
    message:
      'Não é permitido enviar o campo dataNascimento quando pessoaId é informado.',
  })
  dataNascimento?: Date;

  @ApiProperty({
    example: false,
    description:
      'Indica se a pessoa é emancipada. Opcional ao cadastrar nova pessoa. Não deve ser informado se pessoaId for fornecido.',
    required: false,
  })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsOptional()
  @IsBoolean({ message: 'O campo emancipado deve ser booleano' })
  @ValidateIf((dto: CriarBeneficiarioDto) => Boolean(dto.pessoaId))
  @IsEmpty({
    message:
      'Não é permitido enviar o campo emancipado quando pessoaId é informado.',
  })
  emancipado?: boolean;

  @ApiProperty({
    example: true,
    description:
      'Indica se o beneficiário pode sair sozinho da ONG. Obrigatório para menores de 18 anos não emancipados. Não deve ser informado para adultos ou se pessoaId for fornecido.',
    required: false,
  })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsOptional()
  @IsBoolean({ message: 'O campo podeSairSozinho deve ser booleano' })
  @ValidateIf((dto: CriarBeneficiarioDto) => Boolean(dto.pessoaId))
  @IsEmpty({
    message:
      'Não é permitido enviar o campo podeSairSozinho quando pessoaId é informado.',
  })
  podeSairSozinho?: boolean;

  @ApiProperty({
    example: '10',
    description:
      'ID da pessoa responsável. Obrigatório para menores de 18 anos não emancipados. Não deve ser informado se pessoaId for fornecido.',
    required: false,
  })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsOptional()
  @IsString()
  @ValidateIf((dto: CriarBeneficiarioDto) => Boolean(dto.pessoaId))
  @IsEmpty({
    message:
      'Não é permitido enviar o campo responsavelId quando pessoaId é informado.',
  })
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

  @ApiProperty({
    type: [ContatoAninhadoDto],
    description:
      'Lista de contatos da pessoa (mínimo 1, máximo 3 contatos). Obrigatório para beneficiários adultos ou menores emancipados. Opcional para menores de idade não emancipados.',
    required: false,
  })
  @ValidateIf((dto: CriarBeneficiarioDto) => !dto.pessoaId)
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'É obrigatório cadastrar pelo menos 1 contato.' })
  @ArrayMaxSize(3, {
    message: 'É permitido cadastrar no máximo 3 contatos por pessoa.',
  })
  @ValidateNested({ each: true })
  @Type(() => ContatoAninhadoDto)
  contatos?: ContatoAninhadoDto[];
}
