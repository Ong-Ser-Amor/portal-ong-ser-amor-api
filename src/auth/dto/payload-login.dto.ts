import { Usuario } from '../../usuarios/entities/usuario.entity';

export class PayloadLoginDto {
  id: string;

  constructor(usuario: Usuario) {
    this.id = usuario.id;
  }
}
