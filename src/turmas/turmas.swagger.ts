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

import { ERROS_ATUALIZACAO_TURMA } from './constants/turmas-erros.constant';
import { TurmaProfessorRespostaDto } from './dto/turma-professor-resposta.dto';
import { TurmaRespostaDto } from './dto/turma-resposta.dto';
import { TurmaResumoDto } from './dto/turma-resumo.dto';

export function ApiDocCriarTurma() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastrar uma nova turma',
      description:
        '**Perfil com Acesso:** `ADMIN` ou `COORDENADOR_CURSOS`.\n\n' +
        'Cadastra uma nova turma associada a um plano de curso.',
    }),
    ApiCreatedResponse({
      description: 'A turma foi criada com sucesso.',
      type: TurmaRespostaDto,
    }),
    ApiBadRequestResponse({
      description:
        'Houve um erro de validação nos dados fornecidos (ex: datas inválidas ou campos numéricos fora dos limites permitidos).',
    }),
    ApiConflictResponse({
      description:
        'Já existe uma turma cadastrada com este nome para o plano de curso selecionado.',
    }),
    ApiNotFoundResponse({
      description:
        'O plano de curso informado pelo planoCursoId não foi encontrado.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMIN ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao cadastrar a turma.',
    }),
  );
}

export function ApiDocBuscarTurmas() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar uma lista paginada de turmas',
      description:
        '**Perfis com Acesso:** `ADMIN`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade por Perfil:**\n' +
        '- **ADMIN / COORDENADOR_CURSOS**: Retorna todas as turmas cadastradas.\n' +
        '- **PROFESSOR**: Retorna apenas as turmas em que está vinculado como professor.',
    }),
    ApiPaginacaoResposta(TurmaResumoDto),
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
      description: 'Filtra as turmas pertencentes a um curso específico',
      example: '1',
    }),
    ApiQuery({
      name: 'planoCursoId',
      required: false,
      description:
        'Filtra as turmas pertencentes a um plano de curso específico',
      example: '1',
    }),
    ApiBadRequestResponse({
      description:
        'Os parâmetros de paginação (página ou itensPorPagina) devem ser maiores ou iguais a 1.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar as turmas.',
    }),
  );
}

export function ApiDocBuscarTurmaPorId() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar uma turma por ID',
      description:
        '**Perfis com Acesso:** `ADMIN`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade por Perfil:**\n' +
        '- **ADMIN / COORDENADOR_CURSOS**: Podem consultar qualquer turma.\n' +
        '- **PROFESSOR**: Pode consultar apenas turmas em que leciona.',
    }),
    ApiParam({ name: 'id', description: 'ID da turma', type: String }),
    ApiOkResponse({
      description: 'A turma foi encontrada com sucesso.',
      type: TurmaRespostaDto,
    }),
    ApiNotFoundResponse({
      description: 'Turma com o ID especificado não foi encontrada.',
    }),
    ApiForbiddenResponse({
      description:
        'Usuário não tem permissão para acessar os dados desta turma.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar a turma.',
    }),
  );
}

export function ApiDocAtualizarTurma() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar uma turma pelo ID',
      description:
        '**Perfil com Acesso:** `ADMIN` ou `COORDENADOR_CURSOS`.\n\n' +
        'Atualiza campos cadastrais, limites de período letivo, status e critérios de avaliação de uma turma existente.\n\n' +
        '**Regras de Negócio e Bloqueios Específicos:**\n' +
        '- **Alunos Ativos**: Não é permitido alterar o status para `FINALIZADA` se houver matrículas no status `ATIVA`.\n' +
        '- **Choque de Data Inicial**: Não é permitido postergar `dataInicio` para uma data posterior a aulas já agendadas/realizadas.\n' +
        '- **Choque de Data Final**: Não é permitido adiantar `dataFim` para uma data anterior a aulas já agendadas/realizadas.\n' +
        '- **Ordem das Datas**: A nova data final consolidada não pode ser anterior à data de início.\n' +
        '- **Critérios de Avaliação**: As notas e frequências consolidadas devem respeitar o critério configurado.',
    }),
    ApiParam({ name: 'id', description: 'ID da turma', type: String }),
    ApiOkResponse({
      description: 'A turma foi atualizada com sucesso.',
      type: TurmaRespostaDto,
    }),
    ApiNotFoundResponse({
      description: 'Turma com o ID especificado não foi encontrada.',
    }),
    ApiBadRequestResponse({
      description:
        'Erro de validação de regras de negócio ao atualizar a turma.',
      content: {
        'application/json': {
          examples: {
            alunos_ativos_ao_finalizar: {
              summary: 'Tentativa de finalizar turma com matrículas ativas',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_TURMA.ALUNOS_ATIVOS_AO_FINALIZAR.codigo,
                message:
                  ERROS_ATUALIZACAO_TURMA.ALUNOS_ATIVOS_AO_FINALIZAR.mensagem,
                error: 'Bad Request',
              },
            },
            conflito_data_inicio_com_aulas: {
              summary: 'Data de início posterior a aulas já existentes',
              value: {
                statusCode: 400,
                codigo: ERROS_ATUALIZACAO_TURMA.CONFLITO_DATA_INICIO.codigo,
                message: ERROS_ATUALIZACAO_TURMA.CONFLITO_DATA_INICIO.mensagem,
                error: 'Bad Request',
              },
            },
            conflito_data_fim_com_aulas: {
              summary: 'Data de término anterior a aulas já existentes',
              value: {
                statusCode: 400,
                codigo: ERROS_ATUALIZACAO_TURMA.CONFLITO_DATA_FIM.codigo,
                message: ERROS_ATUALIZACAO_TURMA.CONFLITO_DATA_FIM.mensagem,
                error: 'Bad Request',
              },
            },
            data_fim_anterior_inicio: {
              summary: 'Data final consolidada anterior à data de início',
              value: {
                statusCode: 400,
                codigo: ERROS_ATUALIZACAO_TURMA.DATAS_INVERTIDAS.codigo,
                message: ERROS_ATUALIZACAO_TURMA.DATAS_INVERTIDAS.mensagem,
                error: 'Bad Request',
              },
            },
            criterio_sem_controle_com_limites: {
              summary: 'Critério SEM_CONTROLE com nota ou frequência',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_TURMA.CRITERIO_SEM_CONTROLE_INVALIDO.codigo,
                message:
                  ERROS_ATUALIZACAO_TURMA.CRITERIO_SEM_CONTROLE_INVALIDO
                    .mensagem,
                error: 'Bad Request',
              },
            },
            criterio_participacao_sem_frequencia: {
              summary: 'Critério POR_PARTICIPACAO sem frequência mínima',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_TURMA.CRITERIO_PARTICIPACAO_SEM_FREQUENCIA
                    .codigo,
                message:
                  ERROS_ATUALIZACAO_TURMA.CRITERIO_PARTICIPACAO_SEM_FREQUENCIA
                    .mensagem,
                error: 'Bad Request',
              },
            },
            criterio_participacao_com_nota: {
              summary: 'Critério POR_PARTICIPACAO com nota mínima',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_TURMA.CRITERIO_PARTICIPACAO_COM_NOTA.codigo,
                message:
                  ERROS_ATUALIZACAO_TURMA.CRITERIO_PARTICIPACAO_COM_NOTA
                    .mensagem,
                error: 'Bad Request',
              },
            },
            criterio_nota_presenca_incompleto: {
              summary: 'Critério POR_NOTA_PRESENCA sem nota ou frequência',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_TURMA.CRITERIO_NOTA_PRESENCA_INCOMPLETO
                    .codigo,
                message:
                  ERROS_ATUALIZACAO_TURMA.CRITERIO_NOTA_PRESENCA_INCOMPLETO
                    .mensagem,
                error: 'Bad Request',
              },
            },
            criterio_qualitativa_com_nota: {
              summary: 'Critério QUALITATIVA com nota mínima',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_TURMA.CRITERIO_QUALITATIVA_COM_NOTA.codigo,
                message:
                  ERROS_ATUALIZACAO_TURMA.CRITERIO_QUALITATIVA_COM_NOTA
                    .mensagem,
                error: 'Bad Request',
              },
            },
          },
        },
      },
    }),
    ApiConflictResponse({
      description:
        'Já existe uma turma cadastrada com este nome para o plano de curso.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMIN ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao atualizar a turma.',
    }),
  );
}

export function ApiDocRemoverTurma() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deletar uma turma pelo ID',
      description:
        '**Perfil com Acesso:** `ADMIN` ou `COORDENADOR_CURSOS`.\n\n' +
        'Remove logicamente (soft delete) uma turma do sistema.',
    }),
    ApiParam({ name: 'id', description: 'ID da turma', type: String }),
    ApiNoContentResponse({
      description: 'A turma foi removida com sucesso.',
    }),
    ApiNotFoundResponse({
      description: 'Turma com o ID especificado não encontrada.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMIN ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao remover a turma.',
    }),
  );
}

export function ApiDocVincularProfessor() {
  return applyDecorators(
    ApiOperation({
      summary: 'Vincular um professor a uma turma',
      description:
        '**Perfil com Acesso:** `ADMIN` ou `COORDENADOR_CURSOS`.\n\n' +
        'Vincula um professor voluntário a uma turma existente.',
    }),
    ApiParam({ name: 'id', description: 'ID da turma', type: String }),
    ApiOkResponse({
      description: 'O professor foi vinculado à turma com sucesso.',
      type: TurmaProfessorRespostaDto,
    }),
    ApiNotFoundResponse({
      description:
        'Turma ou professor com o ID especificado não foram encontrados.',
    }),
    ApiConflictResponse({
      description: 'O professor já está vinculado a esta turma.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMIN ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao vincular o professor.',
    }),
  );
}

export function ApiDocDesvincularProfessor() {
  return applyDecorators(
    ApiOperation({
      summary: 'Desvincular um professor de uma turma',
      description:
        '**Perfil com Acesso:** `ADMIN` ou `COORDENADOR_CURSOS`.\n\n' +
        'Remove o vínculo de um professor voluntário com a turma.',
    }),
    ApiParam({ name: 'id', description: 'ID da turma', type: String }),
    ApiParam({
      name: 'professorId',
      description: 'ID do professor voluntário',
      type: String,
    }),
    ApiNoContentResponse({
      description: 'O professor foi desvinculado da turma com sucesso.',
    }),
    ApiNotFoundResponse({
      description:
        'Turma ou professor com o ID especificado não foram encontrados, ou o professor não está vinculado a esta turma.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMIN ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao desvincular o professor.',
    }),
  );
}
