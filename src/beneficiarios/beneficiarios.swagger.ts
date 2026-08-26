import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CriarFamiliaDto } from 'src/familias/dto/criar-familia.dto';
import { PessoaDto } from 'src/pessoas/dto/pessoa.dto';
import { ApiPaginacaoResposta } from 'src/shared/decorators/api-paginacao-resposta.decorator';

import {
  API_BODY_CRIAR_BENEFICIARIO,
  API_BODY_TRANSFERIR_FAMILIA,
} from './beneficiarios.schemas';
import { BeneficiarioResumoDto } from './dto/beneficiario-resumo.dto';
import { BeneficiarioDto } from './dto/beneficiario.dto';

export function ApiDocCriarBeneficiario() {
  return applyDecorators(
    ApiExtraModels(CriarFamiliaDto),
    ApiBody(API_BODY_CRIAR_BENEFICIARIO),
    ApiOperation({
      summary: 'Criar um novo beneficiário',
      description:
        'Cadastra um novo beneficiário vinculando uma pessoa (nova ou existente) e sua família.\n\n' +
        '**Regras por Idade e Emancipação:**\n' +
        '- **Menor de idade não emancipado (< 18 anos)**: Os campos `responsavelId` e `podeSairSozinho` são **obrigatórios** (a pessoa responsável informada deve possuir pelo menos 1 contato do tipo CELULAR cadastrado). A lista de `contatos` própria do menor é opcional.\n' +
        '- **Adulto (≥ 18 anos) ou Menor Emancipado (≥ 16 anos)**: A lista de `contatos` é **obrigatória** (mínimo 1 contato, com exatamente 1 contato marcado como `ehPrincipal: true`). Os campos `responsavelId` e `podeSairSozinho` não devem ser informados.',
    }),
    ApiCreatedResponse({
      description: 'O beneficiário foi criado com sucesso.',
      type: BeneficiarioDto,
    }),
    ApiConflictResponse({
      description:
        'Já existe uma pessoa com este CPF ou a pessoa informada já possui um benefício ativo.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao criar o beneficiário.',
    }),
  );
}

export function ApiDocVerificarCadastroPorCpf() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verificar cadastro de beneficiário pelo CPF',
    }),
    ApiParam({
      name: 'cpf',
      required: true,
      example: '12345678900',
      description: 'CPF com 11 dígitos numéricos.',
    }),
    ApiOkResponse({
      description:
        'Pessoa encontrada com sucesso e sem beneficiário vinculado.',
      type: PessoaDto,
    }),
    ApiBadRequestResponse({
      description: 'CPF inválido.',
    }),
    ApiNotFoundResponse({
      description: 'Pessoa não encontrada.',
    }),
    ApiConflictResponse({
      description: 'Pessoa já possui um cadastro de beneficiário ativo.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Erro interno ao verificar o cadastro de beneficiário.',
    }),
  );
}

export function ApiDocBuscarBeneficiarios() {
  return applyDecorators(
    ApiOperation({ summary: 'Buscar uma lista paginada de beneficiários' }),
    ApiPaginacaoResposta(BeneficiarioResumoDto),
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
      example: 'João',
      description: 'Filtra beneficiários por parte do nome da pessoa',
    }),
    ApiQuery({
      name: 'cpf',
      required: false,
      example: '12345678900',
      description:
        'Filtra beneficiários por CPF da pessoa. Deve conter exatamente 11 dígitos numéricos, sem pontos ou traços.',
    }),
    ApiQuery({
      name: 'familiaId',
      required: false,
      example: '456',
      description: 'Filtra beneficiários pelo ID da família',
    }),
    ApiQuery({
      name: 'ignorarId',
      required: false,
      example: '123',
      description:
        'ID do beneficiário a ser ignorado/excluído do resultado da busca (ex: para listar familiares excluindo o próprio beneficiário da tela)',
    }),
    ApiBadRequestResponse({
      description:
        'Os parâmetros de paginação (página ou itensPorPagina) devem ser maiores ou iguais a 1.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar os beneficiários.',
    }),
  );
}

export function ApiDocBuscarBeneficiarioPorId() {
  return applyDecorators(
    ApiOperation({ summary: 'Buscar um beneficiário pelo ID' }),
    ApiOkResponse({
      description: 'O beneficiário foi encontrado com sucesso.',
      type: BeneficiarioDto,
    }),
    ApiNotFoundResponse({
      description: 'Beneficiário não encontrado.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar o beneficiário.',
    }),
  );
}

export function ApiDocAtualizarBeneficiario() {
  return applyDecorators(
    ApiOperation({ summary: 'Atualizar os dados de um beneficiário' }),
    ApiOkResponse({
      description: 'O beneficiário foi atualizado com sucesso.',
      type: BeneficiarioDto,
    }),
    ApiNotFoundResponse({
      description: 'Beneficiário não encontrado.',
    }),
    ApiConflictResponse({
      description: 'Já existe uma pessoa cadastrada com este CPF.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao atualizar o beneficiário.',
    }),
  );
}

export function ApiDocTransferirFamilia() {
  return applyDecorators(
    ApiExtraModels(CriarFamiliaDto),
    ApiBody(API_BODY_TRANSFERIR_FAMILIA),
    ApiOperation({
      summary:
        'Transfere o beneficiário para uma nova família (existente ou recém-criada)',
    }),
    ApiOkResponse({
      description: 'O beneficiário foi transferido com sucesso.',
      type: BeneficiarioDto,
    }),
    ApiNotFoundResponse({
      description: 'Beneficiário ou família destino não encontrados.',
    }),
    ApiBadRequestResponse({
      description:
        'O beneficiário já pertence a esta família ou os dados enviados são inválidos.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao transferir o beneficiário.',
    }),
  );
}

export function ApiDocRemoverBeneficiario() {
  return applyDecorators(
    ApiOperation({ summary: 'Deletar beneficiário pelo ID' }),
    ApiNoContentResponse({
      description: 'O beneficiário foi deletado com sucesso.',
    }),
    ApiNotFoundResponse({
      description: 'Beneficiário não encontrado.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao deletar o beneficiário.',
    }),
  );
}
