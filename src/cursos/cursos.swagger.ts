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

import { CursoRespostaDto } from './dto/curso-resposta.dto';

export function ApiDocCriarCurso() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar um novo curso',
      description:
        '**Perfil com Acesso:** `ADMINISTRADOR` ou `COORDENADOR_CURSOS`.\n\n' +
        'Cadastra um novo curso no sistema.',
    }),
    ApiCreatedResponse({
      description: 'O curso foi criado com sucesso.',
      type: CursoRespostaDto,
    }),
    ApiConflictResponse({
      description: 'Já existe um curso cadastrado com este nome.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMINISTRADOR ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao criar o curso.',
    }),
  );
}

export function ApiDocBuscarCursos() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar uma lista paginada de cursos',
      description:
        '**Perfis com Acesso:** `ADMINISTRADOR`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade por Perfil:**\n' +
        '- **ADMINISTRADOR / COORDENADOR_CURSOS**: Retorna todos os cursos cadastrados.\n' +
        '- **PROFESSOR**: Retorna apenas os cursos que possuem turmas vinculadas ao professor logado.',
    }),
    ApiPaginacaoResposta(CursoRespostaDto),
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
    ApiBadRequestResponse({
      description:
        'Os parâmetros de paginação (página ou itensPorPagina) devem ser maiores ou iguais a 1.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar os cursos.',
    }),
  );
}

export function ApiDocBuscarCursoPorId() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar curso pelo ID',
      description:
        '**Perfis com Acesso:** `ADMINISTRADOR`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade por Perfil:**\n' +
        '- **ADMINISTRADOR / COORDENADOR_CURSOS**: Podem consultar qualquer curso.\n' +
        '- **PROFESSOR**: Pode consultar apenas cursos vinculados às turmas que leciona.',
    }),
    ApiParam({ name: 'id', description: 'ID do curso', type: String }),
    ApiOkResponse({
      description: 'O curso foi encontrado com sucesso.',
      type: CursoRespostaDto,
    }),
    ApiNotFoundResponse({
      description: 'Curso com o ID especificado não encontrado.',
    }),
    ApiForbiddenResponse({
      description:
        'Usuário não tem permissão para acessar os dados deste curso.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar o curso.',
    }),
  );
}

export function ApiDocAtualizarCurso() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar curso pelo ID',
      description:
        '**Perfil com Acesso:** `ADMINISTRADOR` ou `COORDENADOR_CURSOS`.\n\n' +
        'Atualiza as informações de um curso existente.',
    }),
    ApiParam({ name: 'id', description: 'ID do curso', type: String }),
    ApiOkResponse({
      description: 'O curso foi atualizado com sucesso.',
      type: CursoRespostaDto,
    }),
    ApiNotFoundResponse({
      description: 'Curso não encontrado.',
    }),
    ApiConflictResponse({
      description: 'Já existe um curso cadastrado com este nome.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMINISTRADOR ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao atualizar o curso.',
    }),
  );
}

export function ApiDocRemoverCurso() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deletar curso pelo ID',
      description:
        '**Perfil com Acesso:** `ADMINISTRADOR` ou `COORDENADOR_CURSOS`.\n\n' +
        'Remove logicamente (soft delete) um curso do sistema.',
    }),
    ApiParam({ name: 'id', description: 'ID do curso', type: String }),
    ApiNoContentResponse({
      description: 'O curso foi deletado com sucesso.',
    }),
    ApiNotFoundResponse({
      description: 'Curso não encontrado.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMINISTRADOR ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao deletar o curso.',
    }),
  );
}
