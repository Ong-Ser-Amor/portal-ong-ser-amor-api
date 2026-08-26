import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PessoaDto } from 'src/pessoas/dto/pessoa.dto';
import { ApiPaginacaoResposta } from 'src/shared/decorators/api-paginacao-resposta.decorator';

import { VoluntarioResumoDto } from './dto/voluntario-resumo.dto';
import { VoluntarioDto } from './dto/voluntario.dto';
import { API_BODY_CRIAR_VOLUNTARIO } from './voluntarios.schemas';

export function ApiDocCriarVoluntario() {
  return applyDecorators(
    ApiBody(API_BODY_CRIAR_VOLUNTARIO),
    ApiOperation({
      summary: 'Criar um novo voluntário',
      description:
        '**Perfil com Acesso:** `ADMIN` (Administrador).\n\n' +
        'Cadastra um novo voluntário vinculando a uma pessoa existente ou criando um novo registro de pessoa.',
    }),
    ApiCreatedResponse({
      description: 'O voluntário foi criado com sucesso.',
      type: VoluntarioDto,
    }),
    ApiConflictResponse({
      description:
        'Já existe uma pessoa com este CPF ou a pessoa informada já possui um cadastro de voluntário ativo.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao criar o voluntário.',
    }),
  );
}

export function ApiDocVerificarCadastroPorCpf() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verificar cadastro de voluntário pelo CPF',
      description:
        '**Perfil com Acesso:** `ADMIN` (Administrador).\n\n' +
        'Verifica se uma pessoa já possui cadastro e se já está vinculada como voluntária.',
    }),
    ApiParam({
      name: 'cpf',
      required: true,
      example: '12345678900',
      description: 'CPF com 11 dígitos numéricos.',
    }),
    ApiOkResponse({
      description: 'Pessoa encontrada com sucesso e sem voluntário vinculado.',
      type: PessoaDto,
    }),
    ApiBadRequestResponse({
      description: 'CPF inválido.',
    }),
    ApiNotFoundResponse({
      description: 'Pessoa não encontrada.',
    }),
    ApiConflictResponse({
      description: 'Pessoa já possui um cadastro de voluntário ativo.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Erro interno ao verificar o cadastro de voluntário.',
    }),
  );
}

export function ApiDocBuscarVoluntarios() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar uma lista paginada de voluntários',
      description:
        '**Perfil com Acesso:** `ADMIN` (Administrador).\n\n' +
        'Retorna a listagem paginada de todos os voluntários da ONG.',
    }),
    ApiPaginacaoResposta(VoluntarioResumoDto),
    ApiQuery({
      name: 'pagina',
      required: false,
      example: 1,
      description: 'Número da página atual (padrão: 1)',
    }),
    ApiQuery({
      name: 'itensPorPagina',
      required: false,
      example: 10,
      description: 'Número de itens por página (padrão: 10)',
    }),
    ApiQuery({
      name: 'nome',
      required: false,
      example: 'Carlos',
      description: 'Filtra voluntários por parte do nome da pessoa',
    }),
    ApiBadRequestResponse({
      description:
        'Os parâmetros de paginação (página ou itensPorPagina) devem ser maiores ou iguais a 1.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar os voluntários.',
    }),
  );
}

export function ApiDocBuscarVoluntarioPorId() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar voluntário pelo ID',
      description:
        '**Perfil com Acesso:** `ADMIN` (Administrador).\n\n' +
        'Busca as informações detalhadas de um voluntário específico pelo seu ID.',
    }),
    ApiParam({ name: 'id', description: 'ID do voluntário', type: String }),
    ApiOkResponse({
      description: 'O voluntário foi encontrado com sucesso.',
      type: VoluntarioDto,
    }),
    ApiNotFoundResponse({
      description: 'Voluntário não encontrado.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar o voluntário.',
    }),
  );
}

export function ApiDocAtualizarVoluntario() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar voluntário pelo ID',
      description:
        '**Perfil com Acesso:** `ADMIN` (Administrador).\n\n' +
        'Atualiza os dados de um voluntário existente.',
    }),
    ApiParam({ name: 'id', description: 'ID do voluntário', type: String }),
    ApiOkResponse({
      description: 'O voluntário foi atualizado com sucesso.',
      type: VoluntarioDto,
    }),
    ApiNotFoundResponse({
      description: 'Voluntário não encontrado.',
    }),
    ApiConflictResponse({
      description: 'Já existe uma pessoa cadastrada com este CPF.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao atualizar o voluntário.',
    }),
  );
}

export function ApiDocRemoverVoluntario() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deletar voluntário pelo ID',
      description:
        '**Perfil com Acesso:** `ADMIN` (Administrador).\n\n' +
        'Remove logicamente (soft delete) um voluntário do sistema.',
    }),
    ApiParam({ name: 'id', description: 'ID do voluntário', type: String }),
    ApiNoContentResponse({
      description: 'O voluntário foi deletado com sucesso.',
    }),
    ApiNotFoundResponse({
      description: 'Voluntário não encontrado.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao deletar o voluntário.',
    }),
  );
}
