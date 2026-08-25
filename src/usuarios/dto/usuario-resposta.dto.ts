import { ApiProperty } from '@nestjs/swagger';

import { Usuario } from '../entities/usuario.entity';
import { PerfilAcesso } from '../enums/perfil-acesso.enum';

export class UsuarioRespostaDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'carlos.santos@example.com' })
  email: string;

  @ApiProperty({
    enum: PerfilAcesso,
    isArray: true,
    example: [PerfilAcesso.PROFESSOR],
  })
  perfisAcesso: PerfilAcesso[];

  constructor(usuario: Usuario) {
    this.id = usuario.id;
    this.email = usuario.email;
    this.perfisAcesso = usuario.perfisAcesso || [];
  }
}
