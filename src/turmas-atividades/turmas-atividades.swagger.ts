import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { TurmaAtividadeEntregaRespostaDto } from './dto/turma-atividade-entrega-resposta.dto';
import { TurmaAtividadeRespostaDto } from './dto/turma-atividade-resposta.dto';

export function ApiDocCriarTurmaAtividade() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastrar uma nova atividade para uma turma',
      description:
        '**Perfis com Acesso:** `ADMIN`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Acesso:**\n' +
        '- **ADMIN / COORDENADOR_CURSOS**: Podem criar atividades em qualquer turma.\n' +
        '- **PROFESSOR**: Pode criar atividades apenas nas turmas em que leciona.',
    }),
    ApiCreatedResponse({
      description:
        'A atividade foi cadastrada com sucesso e as pendências de entrega de todos os alunos ativos foram inicializadas.',
      type: TurmaAtividadeRespostaDto,
    }),
    ApiBadRequestResponse({
      description:
        'Houve quebra nas regras de consistência de datas (fora do limite da turma) ou tentativa de atribuir nota em turmas com critérios qualitativos/livres.',
    }),
    ApiNotFoundResponse({
      description: 'A turma informada no id não existe no sistema.',
    }),
    ApiInternalServerErrorResponse({
      description:
        'Ocorreu um erro inesperado ao processar a criação da atividade em lote.',
    }),
  );
}

export function ApiDocBuscarAtividadesPorTurma() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar todas as atividades de uma turma específica',
      description:
        '**Perfis com Acesso:** `ADMIN`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade:**\n' +
        '- **ADMIN / COORDENADOR_CURSOS**: Podem listar atividades de qualquer turma.\n' +
        '- **PROFESSOR**: Pode listar atividades apenas das turmas em que leciona.',
    }),
    ApiParam({ name: 'turmaId', description: 'ID da turma', type: String }),
    ApiOkResponse({
      description: 'A lista de atividades da turma foi recuperada com sucesso.',
      type: [TurmaAtividadeRespostaDto],
    }),
    ApiNotFoundResponse({
      description: 'A turma informada no id não existe no sistema.',
    }),
    ApiInternalServerErrorResponse({
      description:
        'Ocorreu um erro inesperado ao buscar as atividades da turma.',
    }),
  );
}

export function ApiDocBuscarEntregasPorAtividade() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar todas as entregas e notas de alunos por atividade',
      description:
        '**Perfis com Acesso:** `ADMIN`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade:**\n' +
        '- **ADMIN / COORDENADOR_CURSOS**: Podem visualizar entregas de qualquer atividade.\n' +
        '- **PROFESSOR**: Pode visualizar entregas apenas de atividades das turmas em que leciona.',
    }),
    ApiParam({
      name: 'atividadeId',
      description: 'ID da atividade',
      type: String,
    }),
    ApiOkResponse({
      description:
        'A lista de entregas dos alunos da atividade foi encontrada com sucesso.',
      type: [TurmaAtividadeEntregaRespostaDto],
    }),
    ApiNotFoundResponse({
      description: 'A atividade com o ID especificado não foi encontrada.',
    }),
    ApiInternalServerErrorResponse({
      description:
        'Ocorreu um erro inesperado ao carregar o painel de entregas.',
    }),
  );
}

export function ApiDocRegistrarEntregasEmLote() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrar notas e status de entregas de alunos em lote',
      description:
        '**Perfis com Acesso:** `ADMIN`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Acesso:**\n' +
        '- **ADMIN / COORDENADOR_CURSOS**: Podem lançar notas em qualquer atividade.\n' +
        '- **PROFESSOR**: Pode lançar notas apenas em atividades das turmas em que leciona.',
    }),
    ApiNoContentResponse({
      description:
        'O lote de avaliações e notas dos estudantes foi processado e salvo com sucesso.',
    }),
    ApiBadRequestResponse({
      description:
        'Tentativa de lançar nota em atividade não avaliativa ou a nota informada ultrapassou o limite máximo da atividade.',
    }),
    ApiNotFoundResponse({
      description:
        'Um ou mais IDs de registros de entregas informados na lista não foram localizados.',
    }),
    ApiInternalServerErrorResponse({
      description:
        'Ocorreu um erro inesperado ou falha de transação ao processar o lote de notas.',
    }),
  );
}

export function ApiDocAtualizarTurmaAtividade() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar dados de uma atividade cadastrada',
      description:
        '**Perfis com Acesso:** `ADMIN`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Acesso:**\n' +
        '- **ADMIN / COORDENADOR_CURSOS**: Podem atualizar atividades de qualquer turma.\n' +
        '- **PROFESSOR**: Pode atualizar atividades apenas das turmas em que leciona.',
    }),
    ApiParam({ name: 'id', description: 'ID da atividade', type: String }),
    ApiOkResponse({
      description: 'A atividade foi atualizada com sucesso.',
      type: TurmaAtividadeRespostaDto,
    }),
    ApiNotFoundResponse({
      description: 'Atividade com o ID especificado não foi encontrada.',
    }),
    ApiBadRequestResponse({
      description:
        'Houve quebra nas regras de consistência de datas, tentativa de atribuir nota em turmas com critérios não avaliativos ou tentativa de reduzir a nota máxima com notas já lançadas acima do novo limite.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao atualizar a atividade.',
    }),
  );
}
