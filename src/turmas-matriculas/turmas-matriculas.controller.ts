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
import { ApiPaginacaoResposta } from 'src/dtos/api-paginacao-resposta.decorator';
import { PaginacaoRespostaDto } from 'src/dtos/paginacao-resposta.dto';

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
    @Body() criarTurmasMatriculaDto: CriarTurmaMatriculaDto,
  ): Promise<TurmaMatriculaRespostaDto> {
    const matricula = await this.turmasMatriculasService.criar(
      criarTurmasMatriculaDto,
    );
    return new TurmaMatriculaRespostaDto(matricula);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar uma lista paginada de matrículas' })
  @ApiPaginacaoResposta(TurmaMatriculaRespostaDto)
  @ApiQuery({
    name: 'limite',
    required: false,
    description: 'Número de itens por página (padrão: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    description: 'Número da página atual (padrão: 1)',
    example: 1,
  })
  @ApiInternalServerErrorResponse({
    description:
      'Ocorreu um erro inesperado ao buscar a listagem de matrículas.',
  })
  async buscarTodas(
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number,
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
  ): Promise<PaginacaoRespostaDto<TurmaMatriculaRespostaDto>> {
    const matriculas = await this.turmasMatriculasService.buscarTodas(
      limite,
      pagina,
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
  async findOne(@Param('id') id: string): Promise<TurmaMatriculaRespostaDto> {
    const matricula = await this.turmasMatriculasService.buscarPorId(id);
    return new TurmaMatriculaRespostaDto(matricula);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar notas, pareceres ou status de uma matrícula',
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
      'A turma associada não está com o status EM_ANDAMENTO OU houve quebra nas regras de consistência de notas, pontuações e status da matrícula.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar a matrícula.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarTurmasMatriculaDto: AtualizarTurmaMatriculaDto,
  ): Promise<TurmaMatriculaRespostaDto> {
    const matricula = await this.turmasMatriculasService.atualizar(
      id,
      atualizarTurmasMatriculaDto,
    );
    return new TurmaMatriculaRespostaDto(matricula);
  }

  @Delete(':id')
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
