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
    example: FaixaRenda.ATE_1_SALARIO,
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

  @ApiProperty({
    description: 'Dados do endereço da família',
    type: CriarEnderecoDto,
  })
  @IsNotEmpty({
    message: 'Os dados do endereço são obrigatórios ao criar uma família.',
  })
  @ValidateNested()
  @Type(() => CriarEnderecoDto)
  endereco: CriarEnderecoDto;
}
