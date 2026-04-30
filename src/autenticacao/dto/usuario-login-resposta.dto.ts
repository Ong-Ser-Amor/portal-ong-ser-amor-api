import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

export class UsuarioLoginRespostaDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'admin@email.com' })
  email: string;

  @ApiProperty({ example: '1' })
  voluntarioId: string;

  @ApiProperty({ example: 'Admin' })
  nome: string;

  constructor(usuario: Usuario) {
    this.id = usuario.id;
    this.email = usuario.email;
    this.voluntarioId = usuario.voluntarioId;
    this.nome = usuario.voluntario?.pessoa?.nome || '';
  }
}
