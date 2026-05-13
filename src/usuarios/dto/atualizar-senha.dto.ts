import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AtualizarSenhaDto {
  @IsString({ message: 'A senha atual deve ser um texto.' })
  @IsNotEmpty({ message: 'A senha atual é obrigatória.' })
  senhaAtual: string;

  @IsString({ message: 'A nova senha deve ser um texto.' })
  @IsNotEmpty({ message: 'A nova senha é obrigatória.' })
  @Length(8, 128, {
    message: 'A nova senha deve ter entre 8 e 128 caracteres.',
  })
  novaSenha: string;
}
