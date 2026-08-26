import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

export class PayloadJwtDto {
  sub: string;
  voluntarioId: string;
  nome: string;
  email: string;
  perfisAcesso: PerfilAcesso[];

  constructor(usuario: Usuario) {
    this.sub = usuario.id;
    this.voluntarioId = usuario.voluntarioId;
    this.nome = usuario.voluntario?.pessoa?.nome;
    this.email = usuario.email;
    this.perfisAcesso = usuario.perfisAcesso || [];
  }
}
