import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

import { UsuarioLoginRespostaDto } from './usuario-login-resposta.dto';

export class LoginRespostaDto {
  @ApiProperty()
  tokenAcesso: string;

  @ApiProperty({ type: () => UsuarioLoginRespostaDto, required: false })
  usuario?: UsuarioLoginRespostaDto;

  constructor({
    tokenAcesso,
    usuario,
  }: {
    tokenAcesso: string;
    usuario?: Usuario;
  }) {
    this.tokenAcesso = tokenAcesso;
    this.usuario = usuario ? new UsuarioLoginRespostaDto(usuario) : undefined;
  }
}
