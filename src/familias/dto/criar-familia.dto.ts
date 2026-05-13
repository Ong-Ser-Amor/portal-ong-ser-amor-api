import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

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

  @ApiProperty({
    description: 'O ID do endereço associado à família',
    example: '1',
  })
  @IsString({ message: 'O ID do endereço deve ser um texto.' })
  @IsNotEmpty({ message: 'O ID do endereço é obrigatório.' })
  enderecoId: string;
}
