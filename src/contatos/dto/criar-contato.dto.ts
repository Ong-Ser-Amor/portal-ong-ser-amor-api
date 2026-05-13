import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Matches,
  ValidateIf,
} from 'class-validator';
import { TipoContato } from 'src/contatos/enums/tipo-contato.enum';

export class CriarContatoDto {
  @ApiProperty({ enum: TipoContato, example: TipoContato.EMAIL })
  @IsEnum(TipoContato, { message: 'O tipo de contato fornecido é inválido.' })
  @IsNotEmpty({ message: 'O tipo de contato é obrigatório.' })
  tipoContato: TipoContato;

  // -------------------------------------------------------------------
  // VALIDAÇÕES DINÂMICAS COM BASE NO TIPO DE CONTATO
  // -------------------------------------------------------------------

  // 1. Se for EMAIL: Regra padrão de e-mail
  @ValidateIf(
    (object: CriarContatoDto) => object.tipoContato === TipoContato.EMAIL,
  )
  @IsEmail({}, { message: 'O valor deve ser um endereço de e-mail válido.' })

  // 2. Se for CELULAR: Exatamente 11 dígitos (Ex: 11 9 9999 9999)
  @ValidateIf(
    (object: CriarContatoDto) => object.tipoContato === TipoContato.CELULAR,
  )
  @Matches(/^[0-9]{11}$/, {
    message:
      'O número de celular deve conter exatamente 11 dígitos (apenas números).',
  })

  // 3. Se for TELEFONE_FIXO: Exatamente 10 dígitos (Ex: 11 4000 0000)
  @ValidateIf(
    (object: CriarContatoDto) =>
      object.tipoContato === TipoContato.TELEFONE_FIXO,
  )
  @Matches(/^[0-9]{10}$/, {
    message:
      'O número fixo deve conter exatamente 10 dígitos (apenas números).',
  })
  valor: string;
}
