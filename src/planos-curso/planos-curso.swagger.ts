import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiPaginacaoResposta } from 'src/shared/decorators/api-paginacao-resposta.decorator';

import { PlanoCursoRespostaDto } from './dto/plano-curso-resposta.dto';

export function ApiDocCriarPlanoCurso() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar um novo plano de curso',
      description:
        '**Perfil com Acesso:** `ADMINISTRADOR` ou `COORDENADOR_CURSOS`.\n\n' +
        'Cadastra um novo plano de curso associado a um curso existente.',
    }),
    ApiCreatedResponse({
      description: 'O plano de curso foi criado com sucesso.',
      type: PlanoCursoRespostaDto,
    }),
    ApiConflictResponse({
      description: 'Já existe um plano de curso cadastrado com este nome.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMINISTRADOR ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao criar o plano de curso.',
    }),
  );
}

export function ApiDocBuscarPlanosCurso() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar uma lista paginada de planos de curso',
      description:
        '**Perfis com Acesso:** `ADMINISTRADOR`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade por Perfil:**\n' +
        '- **ADMINISTRADOR / COORDENADOR_CURSOS**: Retorna todos os planos de curso cadastrados.\n' +
        '- **PROFESSOR**: Retorna apenas os planos de curso que possuem turmas vinculadas ao professor logado.',
    }),
    ApiPaginacaoResposta(PlanoCursoRespostaDto),
    ApiQuery({
      name: 'pagina',
      required: false,
      description: 'Número da página atual (padrão: 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'itensPorPagina',
      required: false,
      description: 'Número de itens por página (padrão: 10)',
      example: 10,
    }),
    ApiQuery({
      name: 'cursoId',
      required: false,
      description:
        'Filtra os planos de curso pertencentes a um curso específico',
      example: '1',
    }),
    ApiBadRequestResponse({
      description:
        'Os parâmetros de paginação (página ou itensPorPagina) devem ser maiores ou iguais a 1.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar os planos de curso.',
    }),
  );
}

export function ApiDocBuscarPlanoCursoPorId() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar um plano de curso pelo ID',
      description:
        '**Perfis com Acesso:** `ADMINISTRADOR`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade por Perfil:**\n' +
        '- **ADMINISTRADOR / COORDENADOR_CURSOS**: Podem consultar qualquer plano de curso.\n' +
        '- **PROFESSOR**: Pode consultar apenas planos de curso vinculados às turmas que leciona.',
    }),
    ApiParam({ name: 'id', description: 'ID do plano de curso', type: String }),
    ApiOkResponse({
      description: 'O plano de curso foi encontrado com sucesso.',
      type: PlanoCursoRespostaDto,
    }),
    ApiNotFoundResponse({
      description: 'Plano de curso com o ID especificado não encontrado.',
    }),
    ApiForbiddenResponse({
      description:
        'Usuário não tem permissão para acessar os dados deste plano de curso.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar o plano de curso.',
    }),
  );
}

export function ApiDocAtualizarPlanoCurso() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar um plano de curso pelo ID',
      description:
        '**Perfil com Acesso:** `ADMINISTRADOR` ou `COORDENADOR_CURSOS`.\n\n' +
        'Atualiza as informações de um plano de curso existente.',
    }),
    ApiParam({ name: 'id', description: 'ID do plano de curso', type: String }),
    ApiOkResponse({
      description: 'O plano de curso foi atualizado com sucesso.',
      type: PlanoCursoRespostaDto,
    }),
    ApiNotFoundResponse({
      description: 'Plano de curso com o ID especificado não encontrado.',
    }),
    ApiConflictResponse({
      description: 'Já existe um plano de curso cadastrado com este nome.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMINISTRADOR ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao atualizar o plano de curso.',
    }),
  );
}

export function ApiDocRemoverPlanoCurso() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deletar um plano de curso pelo ID',
      description:
        '**Perfil com Acesso:** `ADMINISTRADOR` ou `COORDENADOR_CURSOS`.\n\n' +
        'Remove logicamente (soft delete) um plano de curso do sistema.',
    }),
    ApiParam({ name: 'id', description: 'ID do plano de curso', type: String }),
    ApiNoContentResponse({
      description: 'O plano de curso foi removido com sucesso.',
    }),
    ApiNotFoundResponse({
      description: 'Plano de curso com o ID especificado não encontrado.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMINISTRADOR ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao remover o plano de curso.',
    }),
  );
}
