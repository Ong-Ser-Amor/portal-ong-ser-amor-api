import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { ChamadaRespostaDto } from './dto/chamada-resposta.dto';

export function ApiDocSalvarChamadaLote() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Registrar ou atualizar a lista de chamada (presenças/faltas) de uma aula em lote',
      description:
        '**Perfis com Acesso:** `ADMINISTRADOR`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Acesso:**\n' +
        '- **ADMINISTRADOR / COORDENADOR_CURSOS**: Podem registrar e editar chamadas em qualquer turma.\n' +
        '- **PROFESSOR**: Pode registrar e editar chamadas apenas em turmas em que leciona.',
    }),
    ApiOkResponse({
      description: 'O lote de chamadas foi processado e salvo com sucesso.',
      type: [ChamadaRespostaDto],
    }),
    ApiBadRequestResponse({
      description:
        'A lista enviada está incompleta, contém alunos não ativos/não pertencentes à turma, a aula está CANCELADA ou houve inconsistência nas justificativas de falta.',
    }),
    ApiNotFoundResponse({
      description: 'A aula informada pelo ID não foi encontrada no sistema.',
    }),
    ApiInternalServerErrorResponse({
      description:
        'Ocorreu um erro inesperado ao processar a lista de chamadas.',
    }),
  );
}

export function ApiDocBuscarChamadasPorAula() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar a lista de chamadas preenchida de uma aula específica',
      description:
        '**Perfis com Acesso:** `ADMINISTRADOR`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        '**Regras de Visibilidade:**\n' +
        '- **ADMINISTRADOR / COORDENADOR_CURSOS**: Podem consultar chamadas de qualquer aula.\n' +
        '- **PROFESSOR**: Pode consultar chamadas apenas de aulas das turmas em que leciona.',
    }),
    ApiParam({ name: 'aulaId', description: 'ID da aula', type: String }),
    ApiOkResponse({
      description: 'A lista de chamadas da aula foi recuperada com sucesso.',
      type: [ChamadaRespostaDto],
    }),
    ApiNotFoundResponse({
      description:
        'A aula especificada não possui registros de chamada ou não foi encontrada.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar as presenças da aula.',
    }),
  );
}

export function ApiDocRemoverChamadasPorAula() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remover o lote de chamadas de uma aula (limpar presenças)',
      description:
        '**Perfis com Acesso:** `ADMINISTRADOR`, `COORDENADOR_CURSOS` e `PROFESSOR`.\n\n' +
        'Exclui todas as presenças/faltas registradas para a aula especificada (soft delete).\n' +
        'Se a aula estiver com status `REALIZADA`, o status é revertido automaticamente para `AGENDADA`.\n\n' +
        '**Regras de Acesso:**\n' +
        '- **ADMINISTRADOR / COORDENADOR_CURSOS**: Podem remover chamadas de qualquer aula.\n' +
        '- **PROFESSOR**: Pode remover chamadas apenas de aulas das turmas em que leciona.',
    }),
    ApiParam({ name: 'aulaId', description: 'ID da aula', type: String }),
    ApiNoContentResponse({
      description:
        'As presenças da aula foram removidas com sucesso e o status da aula foi revertido para AGENDADA.',
    }),
    ApiNotFoundResponse({
      description:
        'A aula informada não foi encontrada ou não possui registros de chamada para serem removidos.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao remover a lista de chamadas.',
    }),
  );
}
