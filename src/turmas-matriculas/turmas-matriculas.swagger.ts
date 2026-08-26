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

import { ERROS_ATUALIZACAO_MATRICULA } from './constants/turmas-matriculas-erros.constant';
import { TurmaMatriculaRespostaDto } from './dto/turma-matricula-resposta.dto';

export function ApiDocCriarTurmaMatricula() {
  return applyDecorators(
    ApiOperation({
      summary: 'Matricular um beneficiário em uma turma',
      description:
        '**Perfil com Acesso:** `ADMINISTRADOR` ou `COORDENADOR_CURSOS`.\n\n' +
        'Realiza a matrícula de um beneficiário ativo em uma turma em andamento.',
    }),
    ApiCreatedResponse({
      description: 'A matrícula do beneficiário foi realizada com sucesso.',
      type: TurmaMatriculaRespostaDto,
    }),
    ApiBadRequestResponse({
      description:
        'A turma selecionada já está finalizada ou foi cancelada no sistema.',
    }),
    ApiNotFoundResponse({
      description:
        'A turma ou o beneficiário informado não existem no sistema.',
    }),
    ApiConflictResponse({
      description:
        'Este beneficiário já se encontra matriculado ativamente na turma informada.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMINISTRADOR ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao processar a matrícula.',
    }),
  );
}

export function ApiDocBuscarTurmasMatriculas() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar uma lista paginada de matrículas',
      description:
        '**Perfis com Acesso:** `ADMINISTRADOR`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade por Perfil:**\n' +
        '- **ADMINISTRADOR / COORDENADOR_CURSOS**: Podem listar matrículas de qualquer turma.\n' +
        '- **PROFESSOR**: Pode listar matrículas apenas das turmas em que leciona.',
    }),
    ApiPaginacaoResposta(TurmaMatriculaRespostaDto),
    ApiQuery({
      name: 'turmaId',
      required: true,
      description: 'ID da turma para listar as matrículas',
      example: '3',
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
    ApiForbiddenResponse({
      description:
        'Usuário não tem permissão para acessar as matrículas desta turma.',
    }),
    ApiInternalServerErrorResponse({
      description:
        'Ocorreu um erro inesperado ao buscar a listagem de matrículas.',
    }),
  );
}

export function ApiDocBuscarTurmaMatriculaPorId() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar o registro de uma matrícula por ID',
      description:
        '**Perfis com Acesso:** `ADMINISTRADOR`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade por Perfil:**\n' +
        '- **ADMINISTRADOR / COORDENADOR_CURSOS**: Podem consultar qualquer matrícula.\n' +
        '- **PROFESSOR**: Pode consultar apenas matrículas de turmas em que leciona.',
    }),
    ApiParam({ name: 'id', description: 'ID da matrícula', type: String }),
    ApiOkResponse({
      description: 'O registro de matrícula foi encontrado com sucesso.',
      type: TurmaMatriculaRespostaDto,
    }),
    ApiNotFoundResponse({
      description:
        'Registro de matrícula com o ID especificado não foi encontrado.',
    }),
    ApiForbiddenResponse({
      description:
        'Usuário não tem permissão para acessar os dados desta matrícula.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar a matrícula.',
    }),
  );
}

export function ApiDocAtualizarTurmaMatricula() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar notas, pareceres ou status de uma matrícula',
      description:
        '**Perfis com Acesso:** `ADMINISTRADOR`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        'Permite atualizar os dados pedagógicos, parecer descritivo e o status da matrícula.\n\n' +
        '**Regras de Negócio e Conclusão de Matrícula:**\n' +
        '- **Turma em Andamento**: Só é permitido alterar matrículas quando a turma estiver com o status `EM_ANDAMENTO`.\n' +
        '- **Atividades Avaliativas Concluídas**: Para concluir uma matrícula (`status: CONCLUIDA`) em turmas avaliadas por nota, todas as atividades avaliativas (`valeNota: true`) devem estar entregues e com nota lançada para o estudante.\n' +
        '- **Resultado e Nota Final**: Em turmas por nota, a definição de `resultadoFinal` e `notaFinal` é obrigatória ao concluir.\n' +
        '- **Controle de Escopo**: Professores só podem atualizar matrículas de turmas em que lecionam.',
    }),
    ApiParam({ name: 'id', description: 'ID da matrícula', type: String }),
    ApiOkResponse({
      description: 'O registro de matrícula foi atualizado com sucesso.',
      type: TurmaMatriculaRespostaDto,
    }),
    ApiNotFoundResponse({
      description:
        'Registro de matrícula com o ID especificado não foi encontrado.',
    }),
    ApiBadRequestResponse({
      description:
        'Erro de validação de regras de negócio ao atualizar a matrícula.',
      content: {
        'application/json': {
          examples: {
            turma_nao_em_andamento: {
              summary: 'Turma não está em andamento',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_MATRICULA.TURMA_NAO_EM_ANDAMENTO.codigo,
                message:
                  'Não é permitido modificar notas, pareceres ou dados cadastrais de matrículas quando a turma está com o status diferente de EM_ANDAMENTO. Status atual da turma: FINALIZADA',
                error: 'Bad Request',
              },
            },
            matricula_nao_concluida_com_resultado: {
              summary: 'Matrícula ATIVA/EVADIDA/CANCELADA com resultado final',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_MATRICULA
                    .MATRICULA_NAO_CONCLUIDA_COM_RESULTADO.codigo,
                message:
                  ERROS_ATUALIZACAO_MATRICULA
                    .MATRICULA_NAO_CONCLUIDA_COM_RESULTADO.mensagem,
                error: 'Bad Request',
              },
            },
            matricula_nao_concluida_com_nota: {
              summary: 'Matrícula ATIVA/EVADIDA/CANCELADA com nota final',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_MATRICULA.MATRICULA_NAO_CONCLUIDA_COM_NOTA
                    .codigo,
                message:
                  ERROS_ATUALIZACAO_MATRICULA.MATRICULA_NAO_CONCLUIDA_COM_NOTA
                    .mensagem,
                error: 'Bad Request',
              },
            },
            atividade_avaliativa_pendente: {
              summary: 'Atividade avaliativa pendente ou sem nota lançada',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_MATRICULA.ATIVIDADE_AVALIATIVA_PENDENTE
                    .codigo,
                message:
                  "Não é possível concluir a matrícula pois a atividade avaliativa 'Exercício 1' está pendente de entrega ou sem nota atribuída para este aluno.",
                error: 'Bad Request',
              },
            },
            resultado_final_obrigatorio: {
              summary: 'Resultado final não informado em turma com nota',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_MATRICULA.RESULTADO_FINAL_OBRIGATORIO
                    .codigo,
                message:
                  ERROS_ATUALIZACAO_MATRICULA.RESULTADO_FINAL_OBRIGATORIO
                    .mensagem,
                error: 'Bad Request',
              },
            },
            nota_final_obrigatoria: {
              summary: 'Nota final não informada em turma com nota',
              value: {
                statusCode: 400,
                codigo:
                  ERROS_ATUALIZACAO_MATRICULA.NOTA_FINAL_OBRIGATORIA.codigo,
                message:
                  ERROS_ATUALIZACAO_MATRICULA.NOTA_FINAL_OBRIGATORIA.mensagem,
                error: 'Bad Request',
              },
            },
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description:
        'Usuário não tem permissão para atualizar os dados desta matrícula.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao atualizar a matrícula.',
    }),
  );
}

export function ApiDocRemoverTurmaMatricula() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remover logicamente uma matrícula pelo ID',
      description:
        '**Perfil com Acesso:** `ADMINISTRADOR` ou `COORDENADOR_CURSOS`.\n\n' +
        'Remove logicamente (soft delete) uma matrícula do sistema.',
    }),
    ApiParam({ name: 'id', description: 'ID da matrícula', type: String }),
    ApiNoContentResponse({
      description: 'A matrícula foi removida com sucesso (soft delete).',
    }),
    ApiNotFoundResponse({
      description:
        'Registro de matrícula com o ID especificado não foi encontrado.',
    }),
    ApiForbiddenResponse({
      description:
        'Acesso não autorizado para o perfil do usuário (requer ADMINISTRADOR ou COORDENADOR_CURSOS).',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao remover a matrícula.',
    }),
  );
}
