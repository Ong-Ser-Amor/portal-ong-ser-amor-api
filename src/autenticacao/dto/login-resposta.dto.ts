import { UsuarioRespostaDto } from 'src/usuarios/dto/usuario-resposta.dto';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

export class LoginRespostaDto {
  tokenAcesso: string;
  usuario?: UsuarioRespostaDto;

  constructor({
    tokenAcesso,
    usuario,
  }: {
    tokenAcesso: string;
    usuario?: Usuario;
  }) {
    this.tokenAcesso = tokenAcesso;
    this.usuario = usuario ? new UsuarioRespostaDto(usuario) : undefined;
  }
}
