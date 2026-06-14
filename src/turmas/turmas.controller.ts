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
import { ApiPaginacaoResposta } from 'src/dtos/api-paginacao-resposta.decorator';
import { PaginacaoRespostaDto } from 'src/dtos/paginacao-resposta.dto';

import { AtualizarTurmaDto } from './dto/atualizar-turma.dto';
import { CriarTurmaDto } from './dto/criar-turma.dto';
import { TurmaRespostaDto } from './dto/turma-resposta.dto';
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
      'A data final não pode ser anterior à data de início da turma.',
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
}
