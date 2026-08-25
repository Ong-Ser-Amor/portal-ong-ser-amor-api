import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
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
import { PayloadJwtDto } from 'src/autenticacao/dto/payload-jwt.dto';
import { ApiPaginacaoResposta } from 'src/shared/decorators/api-paginacao-resposta.decorator';
import { Perfis } from 'src/shared/decorators/perfis.decorator';
import { UsuarioLogado } from 'src/shared/decorators/usuario-logado.decorator';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

import { ERROS_ATUALIZACAO_MATRICULA } from './constants/turmas-matriculas-erros.constant';
import { AtualizarTurmaMatriculaDto } from './dto/atualizar-turma-matricula.dto';
import { CriarTurmaMatriculaDto } from './dto/criar-turma-matricula.dto';
import { TurmaMatriculaRespostaDto } from './dto/turma-matricula-resposta.dto';
import { TurmasMatriculasService } from './turmas-matriculas.service';

@ApiTags('Matrículas das Turmas')
@Controller('turmas-matriculas')
export class TurmasMatriculasController {
  constructor(
    private readonly turmasMatriculasService: TurmasMatriculasService,
  ) {}

  @Post()
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @ApiOperation({ summary: 'Matricular um beneficiário em uma turma' })
  @ApiCreatedResponse({
    description: 'A matrícula do beneficiário foi realizada com sucesso.',
    type: TurmaMatriculaRespostaDto,
  })
  @ApiBadRequestResponse({
    description:
      'A turma selecionada já está finalizada ou foi cancelada no sistema.',
  })
  @ApiNotFoundResponse({
    description: 'A turma ou o beneficiário informado não existem no sistema.',
  })
  @ApiConflictResponse({
    description:
      'Este beneficiário já se encontra matriculado ativamente na turma informada.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao processar a matrícula.',
  })
  async criar(
    @Body() criarTurmaMatriculaDto: CriarTurmaMatriculaDto,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<TurmaMatriculaRespostaDto> {
    const matricula = await this.turmasMatriculasService.criar(
      criarTurmaMatriculaDto,
      usuario,
    );
    return new TurmaMatriculaRespostaDto(matricula);
  }

  @Get()
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
  @ApiOperation({ summary: 'Buscar uma lista paginada de matrículas' })
  @ApiPaginacaoResposta(TurmaMatriculaRespostaDto)
  @ApiQuery({
    name: 'turmaId',
    required: true,
    description: 'ID da turma para listar as matrículas',
    example: '3',
  })
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
  @ApiBadRequestResponse({
    description:
      'Os parâmetros de paginação (página ou itensPorPagina) devem ser maiores ou iguais a 1.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Ocorreu um erro inesperado ao buscar a listagem de matrículas.',
  })
  async buscarTodas(
    @Query('turmaId') turmaId: string,
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('itensPorPagina', new DefaultValuePipe(10), ParseIntPipe)
    itensPorPagina: number,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<PaginacaoRespostaDto<TurmaMatriculaRespostaDto>> {
    const matriculas = await this.turmasMatriculasService.buscarTodas(
      turmaId,
      usuario,
      pagina,
      itensPorPagina,
    );

    const matriculasMapeadasComPaginacao = matriculas.dados.map(
      (matricula) => new TurmaMatriculaRespostaDto(matricula),
    );

    return new PaginacaoRespostaDto<TurmaMatriculaRespostaDto>(
      matriculasMapeadasComPaginacao,
      matriculas.meta.totalItens,
      matriculas.meta.itensPorPagina,
      matriculas.meta.paginaAtual,
    );
  }

  @Get(':id')
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
  @ApiOperation({ summary: 'Buscar o registro de uma matrícula por ID' })
  @ApiOkResponse({
    description: 'O registro de matrícula foi encontrado com sucesso.',
    type: TurmaMatriculaRespostaDto,
  })
  @ApiNotFoundResponse({
    description:
      'Registro de matrícula com o ID especificado não foi encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar a matrícula.',
  })
  async buscarPorId(
    @Param('id') id: string,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<TurmaMatriculaRespostaDto> {
    const matricula = await this.turmasMatriculasService.buscarPorId(
      id,
      usuario,
    );
    return new TurmaMatriculaRespostaDto(matricula);
  }

  @Patch(':id')
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
  @ApiOperation({
    summary: 'Atualizar notas, pareceres ou status de uma matrícula',
    description:
      'Permite atualizar os dados pedagógicos, parecer descritivo e o status da matrícula.\n\n' +
      '**Regras de Negócio e Conclusão de Matrícula:**\n' +
      '- **Turma em Andamento**: Só é permitido alterar matrículas quando a turma estiver com o status `EM_ANDAMENTO`.\n' +
      '- **Atividades Avaliativas Concluídas**: Para concluir uma matrícula (`status: CONCLUIDA`) em turmas avaliadas por nota, todas as atividades avaliativas (`valeNota: true`) devem estar entregues e com nota lançada para o estudante.\n' +
      '- **Resultado e Nota Final**: Em turmas por nota, a definição de `resultadoFinal` e `notaFinal` é obrigatória ao concluir.',
  })
  @ApiOkResponse({
    description: 'O registro de matrícula foi atualizado com sucesso.',
    type: TurmaMatriculaRespostaDto,
  })
  @ApiNotFoundResponse({
    description:
      'Registro de matrícula com o ID especificado não foi encontrado.',
  })
  @ApiBadRequestResponse({
    description:
      'Erro de validação de regras de negócio ao atualizar a matrícula.',
    content: {
      'application/json': {
        examples: {
          turma_nao_em_andamento: {
            summary: 'Turma não está em andamento',
            value: {
              statusCode: 400,
              codigo: ERROS_ATUALIZACAO_MATRICULA.TURMA_NAO_EM_ANDAMENTO.codigo,
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
                ERROS_ATUALIZACAO_MATRICULA.RESULTADO_FINAL_OBRIGATORIO.codigo,
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
              codigo: ERROS_ATUALIZACAO_MATRICULA.NOTA_FINAL_OBRIGATORIA.codigo,
              message:
                ERROS_ATUALIZACAO_MATRICULA.NOTA_FINAL_OBRIGATORIA.mensagem,
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar a matrícula.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarTurmaMatriculaDto: AtualizarTurmaMatriculaDto,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<TurmaMatriculaRespostaDto> {
    const matricula = await this.turmasMatriculasService.atualizar(
      id,
      atualizarTurmaMatriculaDto,
      usuario,
    );
    return new TurmaMatriculaRespostaDto(matricula);
  }

  @Delete(':id')
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover logicamente uma matrícula pelo ID' })
  @ApiNoContentResponse({
    description: 'A matrícula foi removida com sucesso (soft delete).',
  })
  @ApiNotFoundResponse({
    description:
      'Registro de matrícula com o ID especificado não foi encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao remover a matrícula.',
  })
  async remover(@Param('id') id: string): Promise<void> {
    await this.turmasMatriculasService.remover(id);
  }
}
