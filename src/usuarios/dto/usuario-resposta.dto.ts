import { Usuario } from '../entities/usuario.entity';

export class UsuarioRespostaDto {
  id: string;
  email: string;

  constructor(usuario: Usuario) {
    this.id = usuario.id;
    this.email = usuario.email;
  }
}
