import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Perfis } from 'src/shared/decorators/perfis.decorator';
import { UsuarioDecorator } from 'src/shared/decorators/usuario.decorator';

import { AtualizarSenhaDto } from './dto/atualizar-senha.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { UsuarioRespostaDto } from './dto/usuario-resposta.dto';
import { PerfilAcesso } from './enums/perfil-acesso.enum';
import { UsuariosService } from './usuarios.service';
import {
  ApiDocAtualizarSenhaUsuario,
  ApiDocAtualizarUsuario,
  ApiDocBuscarUsuarioPorId,
  ApiDocCriarUsuario,
  ApiDocRemoverUsuario,
} from './usuarios.swagger';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Perfis(PerfilAcesso.ADMINISTRADOR)
  @ApiDocCriarUsuario()
  async criar(
    @Body() criarUsuarioDto: CriarUsuarioDto,
  ): Promise<UsuarioRespostaDto> {
    const usuarioCriado = await this.usuariosService.criar(criarUsuarioDto);
    return new UsuarioRespostaDto(usuarioCriado);
  }

  @Get(':id')
  @Perfis(PerfilAcesso.ADMINISTRADOR)
  @ApiDocBuscarUsuarioPorId()
  async buscarPorId(@Param('id') id: string): Promise<UsuarioRespostaDto> {
    const usuario = await this.usuariosService.buscarPorId(id);
    return new UsuarioRespostaDto(usuario);
  }

  @Patch(':id')
  @Perfis(PerfilAcesso.ADMINISTRADOR)
  @ApiDocAtualizarUsuario()
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarUsuarioDto: AtualizarUsuarioDto,
  ): Promise<UsuarioRespostaDto> {
    const usuarioAtualizado = await this.usuariosService.atualizar(
      id,
      atualizarUsuarioDto,
    );
    return new UsuarioRespostaDto(usuarioAtualizado);
  }

  @Patch('alterar-senha')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDocAtualizarSenhaUsuario()
  async atualizarSenha(
    @Body() atualizarSenhaDto: AtualizarSenhaDto,
    @UsuarioDecorator() usuarioId: string,
  ): Promise<void> {
    return this.usuariosService.atualizarSenha(usuarioId, atualizarSenhaDto);
  }

  @Delete(':id')
  @Perfis(PerfilAcesso.ADMINISTRADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDocRemoverUsuario()
  async remover(@Param('id') id: string): Promise<void> {
    return this.usuariosService.remover(id);
  }
}
