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
  ApiQuery,
} from '@nestjs/swagger';
import { ApiPaginacaoResposta } from 'src/shared/decorators/api-paginacao-resposta.decorator';

import { ERROS_ATUALIZACAO_AULA } from './constants/aulas-erros.constant';
import { AulaRespostaDto } from './dto/aula-resposta.dto';

export function ApiDocCriarAula() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastrar ou agendar uma nova aula para uma turma',
      description:
        '**Perfis com Acesso:** `ADMIN`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Acesso:**\n' +
        '- **ADMIN / COORDENADOR_CURSOS**: Podem agendar aulas em qualquer turma.\n' +
        '- **PROFESSOR**: Pode agendar aulas apenas nas turmas em que leciona.',
    }),
    ApiCreatedResponse({
      description: 'A aula foi cadastrada com sucesso.',
      type: AulaRespostaDto,
    }),
    ApiBadRequestResponse({
      description:
        'A turma não está EM_ANDAMENTO ou a data enviada está fora do período letivo estabelecido.',
    }),
    ApiConflictResponse({
      description:
        'Já existe uma aula cadastrada nesta mesma data para a turma informada.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao cadastrar a aula.',
    }),
  );
}

export function ApiDocBuscarAulas() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar uma lista paginada de aulas registradas',
      description:
        '**Perfis com Acesso:** `ADMIN`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade:**\n' +
        '- **ADMIN / COORDENADOR_CURSOS**: Podem listar aulas de qualquer turma.\n' +
        '- **PROFESSOR**: Pode listar aulas apenas das turmas em que leciona.',
    }),
    ApiPaginacaoResposta(AulaRespostaDto),
    ApiQuery({
      name: 'turmaId',
      required: true,
      description: 'ID da turma para listar as aulas',
      example: '1',
    }),
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
      description: 'Ocorreu um erro inesperado ao buscar a listagem de aulas.',
    }),
  );
}

export function ApiDocBuscarAulaPorId() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar o registro de uma aula por ID',
      description:
        '**Perfis com Acesso:** `ADMIN`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade:**\n' +
        '- **ADMIN / COORDENADOR_CURSOS**: Podem consultar qualquer aula.\n' +
        '- **PROFESSOR**: Pode consultar apenas aulas das turmas em que leciona.',
    }),
    ApiParam({ name: 'id', description: 'ID da aula', type: String }),
    ApiOkResponse({
      description: 'A aula foi encontrada com sucesso.',
      type: AulaRespostaDto,
    }),
    ApiNotFoundResponse({
      description: 'Aula com o ID especificado não foi encontrada.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar a aula.',
    }),
  );
}

export function ApiDocAtualizarAula() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar dados ou o status de uma aula pelo ID',
      description:
        '**Perfis com Acesso:** `ADMIN`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        'Permite atualizar o tema, a data e o status de uma aula existente.\n\n' +
        '**Regras de Negócio e Transições de Status:**\n' +
        '- **Presenças Registradas**: Uma aula com chamadas salvas não pode retornar ao status `AGENDADA` nem ser alterada para `CANCELADA` (é necessário excluir o lote de chamadas primeiro caso tenha sido feito por engano).\n' +
        '- **Marcação de Realização**: Uma aula só pode ser marcada como `REALIZADA` se possuir chamadas registradas.\n' +
        '- **Limites do Calendário**: A data da aula deve estar estritamente contida entre a data de início e de término da turma correspondente.\n' +
        '- **Unicidade de Data**: Não é permitido agendar duas aulas na mesma data para a mesma turma.\n' +
        '- **Controle de Escopo**: Professores só podem atualizar aulas das suas próprias turmas.',
    }),
    ApiParam({ name: 'id', description: 'ID da aula', type: String }),
    ApiOkResponse({
      description: 'O registro da aula foi atualizado com sucesso.',
      type: AulaRespostaDto,
    }),
    ApiNotFoundResponse({
      description: 'Aula com o ID especificado não foi encontrada.',
    }),
    ApiBadRequestResponse({
      description:
        'Erro de validação de regras de negócio ao atualizar a aula.',
      content: {
        'application/json': {
          examples: {
            aula_com_chamada_nao_pode_agendar: {
              summary:
                'Tentativa de reverter para AGENDADA com chamada existente',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_AULA.AULA_COM_CHAMADA_NAO_PODE_AGENDAR
                    .codigo,
                message:
                  ERROS_ATUALIZACAO_AULA.AULA_COM_CHAMADA_NAO_PODE_AGENDAR
                    .mensagem,
                error: 'Bad Request',
              },
            },
            aula_com_chamada_nao_pode_cancelar: {
              summary:
                'Tentativa de cancelar aula que já possui lista de chamada',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_AULA.AULA_COM_CHAMADA_NAO_PODE_CANCELAR
                    .codigo,
                message:
                  ERROS_ATUALIZACAO_AULA.AULA_COM_CHAMADA_NAO_PODE_CANCELAR
                    .mensagem,
                error: 'Bad Request',
              },
            },
            aula_realizada_sem_chamada: {
              summary: 'Tentativa de marcar como REALIZADA sem chamada lançada',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_AULA.AULA_REALIZADA_SEM_CHAMADA.codigo,
                message:
                  ERROS_ATUALIZACAO_AULA.AULA_REALIZADA_SEM_CHAMADA.mensagem,
                error: 'Bad Request',
              },
            },
            aula_data_anterior_inicio_turma: {
              summary: 'Data anterior ao início da turma',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_AULA.AULA_DATA_ANTERIOR_INICIO_TURMA.codigo,
                message:
                  ERROS_ATUALIZACAO_AULA.AULA_DATA_ANTERIOR_INICIO_TURMA
                    .mensagem,
                error: 'Bad Request',
              },
            },
            aula_data_posterior_fim_turma: {
              summary: 'Data posterior ao encerramento da turma',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_AULA.AULA_DATA_POSTERIOR_FIM_TURMA.codigo,
                message:
                  ERROS_ATUALIZACAO_AULA.AULA_DATA_POSTERIOR_FIM_TURMA.mensagem,
                error: 'Bad Request',
              },
            },
          },
        },
      },
    }),
    ApiConflictResponse({
      description: 'Conflito de duplicidade de data na turma.',
      content: {
        'application/json': {
          examples: {
            aula_data_duplicada: {
              summary: 'Aula já cadastrada para esta mesma data na turma',
              value: {
                statusCode: 409,
                codigo: ERROS_ATUALIZACAO_AULA.AULA_DATA_DUPLICADA.codigo,
                message: ERROS_ATUALIZACAO_AULA.AULA_DATA_DUPLICADA.mensagem,
                error: 'Conflict',
              },
            },
          },
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao atualizar a aula.',
    }),
  );
}

export function ApiDocRemoverAula() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remover logicamente uma aula do cronograma pelo ID',
      description:
        '**Perfis com Acesso:** `ADMIN`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        'Remove logicamente (soft delete) uma aula do cronograma da turma.',
    }),
    ApiParam({ name: 'id', description: 'ID da aula', type: String }),
    ApiNoContentResponse({
      description: 'A aula foi removida com sucesso (soft delete).',
    }),
    ApiBadRequestResponse({
      description:
        'Esta aula não pode ser removida pois possui um lote de chamadas ativo e vinculado a ela.',
    }),
    ApiNotFoundResponse({
      description: 'Aula com o ID especificado não foi encontrada.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao remover a aula.',
    }),
  );
}
