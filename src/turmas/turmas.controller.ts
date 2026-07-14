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

import { AtualizarTurmaDto } from './dto/atualizar-turma.dto';
import { CriarTurmaDto } from './dto/criar-turma.dto';
import { TurmaProfessorRespostaDto } from './dto/turma-professor-resposta.dto';
import { TurmaRespostaDto } from './dto/turma-resposta.dto';
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
  @ApiPaginacaoResposta(TurmaRespostaDto)
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
    description: 'Ocorreu um erro inesperado ao buscar as turmas.',
  })
  async buscarTodos(
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number,
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
  ): Promise<PaginacaoRespostaDto<TurmaRespostaDto>> {
    const turmas = await this.turmasService.buscarTodos(limite, pagina);

    const turmasMapeadasComPaginacao = turmas.dados.map(
      (turma) => new TurmaRespostaDto(turma),
    );

    return new PaginacaoRespostaDto<TurmaRespostaDto>(
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
  @ApiOperation({ summary: 'Atualizar uma turma pelo ID' })
  @ApiOkResponse({
    description: 'A turma foi atualizada com sucesso.',
    type: TurmaRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Turma com o ID especificado não foi encontrada.',
  })
  @ApiBadRequestResponse({
    description:
      'A data final não pode ser anterior à data de início, houve inconsistência nos limites de avaliação, a turma possui alunos ativos ao tentar finalizá-la OU a alteração de datas conflita com as aulas já cadastradas.',
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
