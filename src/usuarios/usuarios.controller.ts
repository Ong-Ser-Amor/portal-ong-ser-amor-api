import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsuarioDecorator } from 'src/decorators/usuario.decorator';

import { AtualizarSenhaDto } from './dto/atualizar-senha.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { UsuarioRespostaDto } from './dto/usuario-resposta.dto';
import { UsuariosService } from './usuarios.service';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiCreatedResponse({
    description: 'O usuário foi criado com sucesso.',
    type: UsuarioRespostaDto,
  })
  @ApiConflictResponse({
    description: 'Já existe um usuário cadastrado com este e-mail.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao criar o usuário.',
  })
  async criar(
    @Body() criarUsuarioDto: CriarUsuarioDto,
  ): Promise<UsuarioRespostaDto> {
    const usuarioCriado = await this.usuariosService.criar(criarUsuarioDto);
    return new UsuarioRespostaDto(usuarioCriado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário pelo ID' })
  @ApiOkResponse({
    description: 'O usuário foi encontrado com sucesso.',
    type: UsuarioRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar o usuário.',
  })
  async buscarPorId(@Param('id') id: string): Promise<UsuarioRespostaDto> {
    const usuario = await this.usuariosService.buscarPorId(id);
    return new UsuarioRespostaDto(usuario);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário pelo ID' })
  @ApiOkResponse({
    description: 'O usuário foi atualizado com sucesso.',
    type: UsuarioRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado.',
  })
  @ApiConflictResponse({
    description: 'Este e-mail já está em uso por outro usuário.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar o usuário.',
  })
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

  @Patch('senha')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Atualizar senha do usuário' })
  @ApiNoContentResponse({
    description: 'A senha foi atualizada com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar a senha.',
  })
  async atualizarSenha(
    @Body() atualizarSenhaDto: AtualizarSenhaDto,
    @UsuarioDecorator() usuarioId: string,
  ): Promise<void> {
    return this.usuariosService.atualizarSenha(usuarioId, atualizarSenhaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar usuário pelo ID' })
  @ApiNoContentResponse({
    description: 'O usuário foi deletado com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado.',
  })
  @ApiUnauthorizedResponse({
    description: 'Não autorizado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao deletar o usuário.',
  })
  async remover(@Param('id') id: string): Promise<void> {
    return this.usuariosService.remover(id);
  }
}
