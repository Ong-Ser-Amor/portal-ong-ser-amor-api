import { Usuario } from 'src/usuarios/entities/usuario.entity';

export class UsuarioLoginRespostaDto {
  id: string;
  email: string;
  voluntarioId: string;
  nome: string;

  constructor(usuario: Usuario) {
    this.id = usuario.id;
    this.email = usuario.email;
    this.voluntarioId = usuario.voluntarioId;
    this.nome = usuario.voluntario.pessoa.nome;
  }
}
