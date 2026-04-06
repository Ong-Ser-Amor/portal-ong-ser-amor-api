import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CriarUsuarioDto {
  @ApiProperty({ type: String, example: 'carlos.santos@example.com' })
  @IsEmail({}, { message: 'O e-mail deve ser um endereço válido.' })
  @MaxLength(255, { message: 'O e-mail não pode ter mais de 255 caracteres.' })
  email: string;

  @ApiProperty({ type: String, example: 'SenhaForte123' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @IsString({ message: 'A senha deve ser um texto.' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  @MaxLength(128, { message: 'A senha não pode ter mais de 128 caracteres.' })
  senha: string;
}
