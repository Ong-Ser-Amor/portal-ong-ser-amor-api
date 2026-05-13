import { Usuario } from 'src/usuarios/entities/usuario.entity';

export class PayloadJwtDto {
  sub: string;
  nome: string;
  email: string;

  constructor(usuario: Usuario) {
    this.sub = usuario.id;
    this.nome = usuario.voluntario.pessoa.nome;
    this.email = usuario.email;
  }
}
