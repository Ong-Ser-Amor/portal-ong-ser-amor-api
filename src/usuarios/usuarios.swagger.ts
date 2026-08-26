import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UsuarioRespostaDto } from './dto/usuario-resposta.dto';

export function ApiDocCriarUsuario() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar um novo usuário',
      description:
        '**Perfil com Acesso:** `ADMIN` (Administrador).\n\n' +
        'Cadastra um novo usuário de acesso ao sistema com seus respectivos perfis.',
    }),
    ApiCreatedResponse({
      description: 'O usuário foi criado com sucesso.',
      type: UsuarioRespostaDto,
    }),
    ApiConflictResponse({
      description: 'Já existe um usuário cadastrado com este e-mail.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMIN).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao criar o usuário.',
    }),
  );
}

export function ApiDocBuscarUsuarioPorId() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar usuário pelo ID',
      description:
        '**Perfil com Acesso:** `ADMIN` (Administrador).\n\n' +
        'Busca as informações detalhadas de um usuário pelo seu ID.',
    }),
    ApiParam({ name: 'id', description: 'ID do usuário', type: String }),
    ApiOkResponse({
      description: 'O usuário foi encontrado com sucesso.',
      type: UsuarioRespostaDto,
    }),
    ApiNotFoundResponse({
      description: 'Usuário não encontrado.',
    }),
    ApiUnauthorizedResponse({
      description: 'Não autorizado.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMIN).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar o usuário.',
    }),
  );
}

export function ApiDocAtualizarUsuario() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar usuário pelo ID',
      description:
        '**Perfil com Acesso:** `ADMIN` (Administrador).\n\n' +
        'Atualiza os dados de um usuário existente.',
    }),
    ApiParam({ name: 'id', description: 'ID do usuário', type: String }),
    ApiOkResponse({
      description: 'O usuário foi atualizado com sucesso.',
      type: UsuarioRespostaDto,
    }),
    ApiNotFoundResponse({
      description: 'Usuário não encontrado.',
    }),
    ApiConflictResponse({
      description: 'Este e-mail já está em uso por outro usuário.',
    }),
    ApiUnauthorizedResponse({
      description: 'Não autorizado.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMIN).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao atualizar o usuário.',
    }),
  );
}

export function ApiDocAtualizarSenhaUsuario() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar senha do usuário logado',
      description:
        '**Perfil com Acesso:** Qualquer usuário autenticado.\n\n' +
        'Permite que o usuário autenticado altere sua própria senha de acesso.',
    }),
    ApiNoContentResponse({
      description: 'A senha foi atualizada com sucesso.',
    }),
    ApiNotFoundResponse({
      description: 'Usuário não encontrado.',
    }),
    ApiUnauthorizedResponse({
      description: 'Não autorizado.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao atualizar a senha.',
    }),
  );
}

export function ApiDocRemoverUsuario() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deletar usuário pelo ID',
      description:
        '**Perfil com Acesso:** `ADMIN` (Administrador).\n\n' +
        'Remove logicamente (soft delete) um usuário do sistema.',
    }),
    ApiParam({ name: 'id', description: 'ID do usuário', type: String }),
    ApiNoContentResponse({
      description: 'O usuário foi deletado com sucesso.',
    }),
    ApiNotFoundResponse({
      description: 'Usuário não encontrado.',
    }),
    ApiUnauthorizedResponse({
      description: 'Não autorizado.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMIN).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao deletar o usuário.',
    }),
  );
}
