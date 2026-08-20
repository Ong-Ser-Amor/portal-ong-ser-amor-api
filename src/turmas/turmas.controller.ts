import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginacaoResposta } from 'src/shared/decorators/api-paginacao-resposta.decorator';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';

import { ERROS_ATUALIZACAO_TURMA } from './constants/turmas-erros.constant';
import { AtualizarTurmaDto } from './dto/atualizar-turma.dto';
import { CriarTurmaDto } from './dto/criar-turma.dto';
import { TurmaProfessorRespostaDto } from './dto/turma-professor-resposta.dto';
import { TurmaRespostaDto } from './dto/turma-resposta.dto';
import { TurmaResumoDto } from './dto/turma-resumo.dto';
import { VincularProfessorDto } from './dto/vincular-professor.dto';
import { TurmasService } from './turmas.service';

@ApiTags('Turmas')
@Controller('turmas')
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova turma' })
  @ApiCreatedResponse({
    description: 'A turma foi criada com sucesso.',
    type: TurmaRespostaDto,
  })
  @ApiBadRequestResponse({
    description:
      'Dados de envio inválidos ou inconsistência nas regras e limites de avaliação.',
  })
  @ApiConflictResponse({
    description:
      'Já existe uma turma cadastrada com este nome para o plano de curso.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao criar a turma.',
  })
  async criar(@Body() criarTurmaDto: CriarTurmaDto): Promise<TurmaRespostaDto> {
    const turma = await this.turmasService.criar(criarTurmaDto);
    return new TurmaRespostaDto(turma);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar uma lista paginada de turmas' })
  @ApiPaginacaoResposta(TurmaResumoDto)
  @ApiQuery({
    name: 'pagina',
    required: false,
    description: 'Número da página atual (padrão: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'itensPorPagina',
    required: false,
    description: 'Número de itens por página (padrão: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'cursoId',
    required: false,
    description: 'Filtra as turmas pertencentes a um curso específico',
    example: '1',
  })
  @ApiQuery({
    name: 'planoCursoId',
    required: false,
    description: 'Filtra as turmas pertencentes a um plano de curso específico',
    example: '1',
  })
  @ApiBadRequestResponse({
    description:
      'Os parâmetros de paginação (página ou itensPorPagina) devem ser maiores ou iguais a 1.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar as turmas.',
  })
  async buscarTodos(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('itensPorPagina', new DefaultValuePipe(10), ParseIntPipe)
    itensPorPagina: number,
    @Query('cursoId') cursoId?: string,
    @Query('planoCursoId') planoCursoId?: string,
  ): Promise<PaginacaoRespostaDto<TurmaResumoDto>> {
    const turmas = await this.turmasService.buscarTodos(
      pagina,
      itensPorPagina,
      cursoId,
      planoCursoId,
    );

    const turmasMapeadasComPaginacao = turmas.dados.map(
      (turma) => new TurmaResumoDto(turma),
    );

    return new PaginacaoRespostaDto<TurmaResumoDto>(
      turmasMapeadasComPaginacao,
      turmas.meta.totalItens,
      turmas.meta.itensPorPagina,
      turmas.meta.paginaAtual,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma turma por ID' })
  @ApiOkResponse({
    description: 'A turma foi encontrada com sucesso.',
    type: TurmaRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Turma com o ID especificado não foi encontrada.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar a turma.',
  })
  async buscarPorId(@Param('id') id: string): Promise<TurmaRespostaDto> {
    const turma = await this.turmasService.buscarPorId(id);
    return new TurmaRespostaDto(turma);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar uma turma pelo ID',
    description:
      'Atualiza campos cadastrais, limites de período letivo, status e critérios de avaliação de uma turma existente.\n\n' +
      '**Regras de Negócio e Bloqueios Específicos:**\n' +
      '- **Alunos Ativos**: Não é permitido alterar o status para `FINALIZADA` se houver matrículas no status `ATIVA`.\n' +
      '- **Choque de Data Inicial**: Não é permitido postergar `dataInicio` para uma data posterior a aulas já agendadas/realizadas.\n' +
      '- **Choque de Data Final**: Não é permitido adiantar `dataFim` para uma data anterior a aulas já agendadas/realizadas.\n' +
      '- **Ordem das Datas**: A nova data final consolidada não pode ser anterior à data de início.\n' +
      '- **Critérios de Avaliação**: As notas e frequências consolidadas devem respeitar o critério configurado.',
  })
  @ApiOkResponse({
    description: 'A turma foi atualizada com sucesso.',
    type: TurmaRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Turma com o ID especificado não foi encontrada.',
  })
  @ApiBadRequestResponse({
    description: 'Erro de validação de regras de negócio ao atualizar a turma.',
    content: {
      'application/json': {
        examples: {
          alunos_ativos_ao_finalizar: {
            summary: 'Tentativa de finalizar turma com matrículas ativas',
            value: {
              statusCode: 400,
              codigo: ERROS_ATUALIZACAO_TURMA.ALUNOS_ATIVOS_AO_FINALIZAR.codigo,
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
                ERROS_ATUALIZACAO_TURMA.CRITERIO_SEM_CONTROLE_INVALIDO.mensagem,
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
                ERROS_ATUALIZACAO_TURMA.CRITERIO_PARTICIPACAO_COM_NOTA.mensagem,
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
                ERROS_ATUALIZACAO_TURMA.CRITERIO_QUALITATIVA_COM_NOTA.mensagem,
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description:
      'Já existe uma turma cadastrada com este nome para o plano de curso.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar a turma.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarTurmaDto: AtualizarTurmaDto,
  ) {
    const turma = await this.turmasService.atualizar(id, atualizarTurmaDto);
    return new TurmaRespostaDto(turma);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar uma turma pelo ID' })
  @ApiNoContentResponse({
    description: 'A turma foi removida com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Turma com o ID especificado não encontrada.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao remover a turma.',
  })
  async remover(@Param('id') id: string): Promise<void> {
    await this.turmasService.remover(id);
  }

  @Post(':id/professores')
  @ApiOperation({ summary: 'Vincular um professor a uma turma' })
  @ApiOkResponse({
    description: 'O professor foi vinculado à turma com sucesso.',
    type: TurmaProfessorRespostaDto,
  })
  @ApiNotFoundResponse({
    description:
      'Turma ou professor com o ID especificado não foram encontrados.',
  })
  @ApiConflictResponse({
    description: 'O professor já está vinculado a esta turma.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao vincular o professor.',
  })
  async vincularProfessor(
    @Param('id') turmaId: string,
    @Body() vincularProfessorDto: VincularProfessorDto,
  ) {
    const vinculo = await this.turmasService.vincularProfessor(
      turmaId,
      vincularProfessorDto,
    );
    return new TurmaProfessorRespostaDto(vinculo);
  }

  @Delete(':id/professores/:professorId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desvincular um professor de uma turma' })
  @ApiNoContentResponse({
    description: 'O professor foi desvinculado da turma com sucesso.',
  })
  @ApiNotFoundResponse({
    description:
      'Turma ou professor com o ID especificado não foram encontrados, ou o professor não está vinculado a esta turma.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao desvincular o professor.',
  })
  async desvincularProfessor(
    @Param('id') turmaId: string,
    @Param('professorId') professorId: string,
  ): Promise<void> {
    return await this.turmasService.desvincularProfessor(turmaId, professorId);
  }
}
