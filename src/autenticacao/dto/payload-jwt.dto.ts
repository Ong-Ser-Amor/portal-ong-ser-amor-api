import { Usuario } from 'src/usuarios/entities/usuario.entity';

export class PayloadJwtDto {
  sub: string;

  constructor(usuario: Usuario) {
    this.sub = usuario.id;
  }
}
