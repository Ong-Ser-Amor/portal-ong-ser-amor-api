import { Usuario } from 'src/usuarios/entities/usuario.entity';

import { UsuarioLoginRespostaDto } from './usuario-login-resposta.dto';

export class LoginRespostaDto {
  tokenAcesso: string;
  usuario: UsuarioLoginRespostaDto;

  constructor({
    tokenAcesso,
    usuario,
  }: {
    tokenAcesso: string;
    usuario: Usuario;
  }) {
    this.tokenAcesso = tokenAcesso;
    this.usuario = new UsuarioLoginRespostaDto(usuario);
  }
}
