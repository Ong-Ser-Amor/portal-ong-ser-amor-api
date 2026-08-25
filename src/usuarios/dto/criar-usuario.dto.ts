import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { PerfilAcesso } from '../enums/perfil-acesso.enum';

export class CriarUsuarioDto {
  @ApiProperty({
    type: String,
    example: '123',
  })
  @IsNotEmpty({ message: 'O ID do voluntário é obrigatório.' })
  @IsString({ message: 'O ID do voluntário deve ser um texto.' })
  voluntarioId: string;

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

  @ApiProperty({
    enum: PerfilAcesso,
    isArray: true,
    example: [PerfilAcesso.PROFESSOR],
  })
  @IsNotEmpty({ message: 'Os perfis de acesso são obrigatórios.' })
  @IsArray({
    message: 'Os perfis de acesso devem ser informados em formato de lista.',
  })
  @ArrayMinSize(1, {
    message: 'O usuário deve possuir pelo menos um perfil de acesso.',
  })
  @IsEnum(PerfilAcesso, {
    each: true,
    message: 'Cada perfil informado deve ser um perfil de acesso válido.',
  })
  perfisAcesso: PerfilAcesso[];
}
