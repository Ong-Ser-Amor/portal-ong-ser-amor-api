import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { ContatoDto } from './dto/contato.dto';

export function ApiDocCriarContato() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastrar um novo contato para uma pessoa',
      description:
        '**Perfil com Acesso:** `ADMINISTRADOR`.\n\n' +
        'Cadastra um novo contato para uma pessoa vinculada ao sistema.',
    }),
    ApiCreatedResponse({
      description: 'O contato foi cadastrado com sucesso.',
      type: ContatoDto,
    }),
    ApiBadRequestResponse({
      description:
        'Dados inválidos enviados na requisição ou violação das regras de negócio (ex: máximo de 3 contatos por pessoa, máximo de 2 celulares/1 email/1 fixo, exatamente 1 contato principal).',
    }),
    ApiConflictResponse({
      description: 'Este número ou e-mail já está cadastrado para esta pessoa.',
    }),
    ApiNotFoundResponse({
      description: 'Pessoa não encontrada.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao cadastrar o contato.',
    }),
  );
}

export function ApiDocBuscarContatosPorPessoaId() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar todos os contatos de uma pessoa',
      description:
        '**Perfil com Acesso:** `ADMINISTRADOR`.\n\n' +
        'Retorna todos os contatos vinculados a uma pessoa específica.',
    }),
    ApiParam({ name: 'pessoaId', description: 'ID da pessoa', type: String }),
    ApiOkResponse({
      description: 'Lista de contatos da pessoa retornada com sucesso.',
      type: [ContatoDto],
    }),
    ApiNotFoundResponse({
      description: 'Pessoa não encontrada.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar os contatos.',
    }),
  );
}

export function ApiDocAtualizarContato() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar os dados de um contato existente',
      description:
        '**Perfil com Acesso:** `ADMINISTRADOR`.\n\n' +
        'Atualiza as informações de um contato existente.',
    }),
    ApiParam({ name: 'id', description: 'ID do contato', type: String }),
    ApiOkResponse({
      description: 'O contato foi atualizado com sucesso.',
      type: ContatoDto,
    }),
    ApiBadRequestResponse({
      description:
        'Dados inválidos enviados na requisição ou violação das regras de negócio de contatos.',
    }),
    ApiConflictResponse({
      description:
        'Já existe outro contato cadastrado com este valor para esta pessoa.',
    }),
    ApiNotFoundResponse({
      description: 'Contato não encontrado.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao atualizar o contato.',
    }),
  );
}

export function ApiDocRemoverContato() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remover um contato existente',
      description:
        '**Perfil com Acesso:** `ADMINISTRADOR`.\n\n' +
        'Remove um contato existente do sistema.',
    }),
    ApiParam({ name: 'id', description: 'ID do contato', type: String }),
    ApiNoContentResponse({
      description: 'O contato foi removido com sucesso.',
    }),
    ApiBadRequestResponse({
      description:
        'Não é permitido remover o contato se a pessoa (adulto/emancipado) ficar sem contatos ou se for o único contato principal.',
    }),
    ApiNotFoundResponse({
      description: 'Contato não encontrado.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao remover o contato.',
    }),
  );
}
