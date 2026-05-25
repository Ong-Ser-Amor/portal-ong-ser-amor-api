import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CriarEnderecoDto } from 'src/enderecos/dto/criar-endereco.dto';

import { FaixaRenda } from '../enums/faixa-renda.enum';
import { TipoMoradia } from '../enums/tipo-moradia.enum';

export class CriarFamiliaDto {
  @ApiProperty({
    enum: FaixaRenda,
    description: 'A faixa de renda da família',
    example: 'DE_1_A_3_SALARIOS_MINIMOS',
  })
  @IsEnum(FaixaRenda, {
    message: 'A faixa de renda fornecida é inválida.',
  })
  @IsNotEmpty({ message: 'A faixa de renda é obrigatória.' })
  faixaRenda: FaixaRenda;

  @ApiProperty({
    description:
      'Indica se a família participa de programas sociais (ex: Bolsa Família, Auxílio Gás)',
    example: true,
  })
  @IsBoolean({
    message:
      'O campo possui benefício social deve ser um valor booleano (verdadeiro ou falso).',
  })
  possuiBeneficioSocial: boolean;

  @ApiProperty({
    enum: TipoMoradia,
    description: 'O tipo de moradia da família',
    example: 'ALUGADA',
  })
  @IsEnum(TipoMoradia, {
    message: 'O tipo de moradia fornecido é inválido.',
  })
  @IsNotEmpty({ message: 'O tipo de moradia é obrigatório.' })
  tipoMoradia: TipoMoradia;

  // =========================================================
  // VALIDAÇÃO CONDICIONAL PARA ENDEREÇO
  // =========================================================

  @ApiProperty({
    description: 'ID do endereço (caso já exista)',
    example: '1',
    required: false,
  })
  @ValidateIf((dto: CriarFamiliaDto) => !dto.novoEndereco)
  @IsString({ message: 'O ID do endereço deve ser um texto.' })
  @IsNotEmpty({
    message:
      'O ID do endereço é obrigatório se um novo endereço não for fornecido.',
  })
  enderecoId?: string;

  @ApiProperty({
    description: 'Dados para criar um novo endereço',
    type: CriarEnderecoDto,
    required: false,
  })
  @ValidateIf((dto: CriarFamiliaDto) => !dto.enderecoId)
  @IsNotEmpty({
    message:
      'É obrigatório informar o enderecoId ou os dados de um novoEndereco.',
  })
  @ValidateNested()
  @Type(() => CriarEnderecoDto)
  novoEndereco?: CriarEnderecoDto;
}
