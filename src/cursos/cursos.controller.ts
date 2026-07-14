import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  Query,
} from '@nestjs/common';
import {
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

import { CursosService } from './cursos.service';
import { AtualizarCursoDto } from './dto/atualizar-curso.dto';
import { CriarCursoDto } from './dto/criar-curso.dto';
import { CursoRespostaDto } from './dto/curso-resposta.dto';

@ApiTags('Cursos')
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo curso' })
  @ApiCreatedResponse({
    description: 'O curso foi criado com sucesso.',
    type: CursoRespostaDto,
  })
  @ApiConflictResponse({
    description: 'Já existe um curso cadastrado com este nome.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao criar o curso.',
  })
  async criar(@Body() criarCursoDto: CriarCursoDto): Promise<CursoRespostaDto> {
    const curso = await this.cursosService.criar(criarCursoDto);
    return new CursoRespostaDto(curso);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar uma lista paginada de cursos' })
  @ApiPaginacaoResposta(CursoRespostaDto)
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
    description: 'Ocorreu um erro inesperado ao buscar os cursos.',
  })
  async buscarTodos(
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number,
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
  ): Promise<PaginacaoRespostaDto<CursoRespostaDto>> {
    const cursosPaginados = await this.cursosService.buscarTodos(
      limite,
      pagina,
    );

    const cursosDtos = cursosPaginados.dados.map(
      (curso) => new CursoRespostaDto(curso),
    );

    return new PaginacaoRespostaDto<CursoRespostaDto>(
      cursosDtos,
      cursosPaginados.meta.totalItens,
      cursosPaginados.meta.itensPorPagina,
      cursosPaginados.meta.paginaAtual,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar curso pelo ID' })
  @ApiOkResponse({
    description: 'O curso foi encontrado com sucesso.',
    type: CursoRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Curso com o ID especificado não encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar o curso.',
  })
  async buscarPorId(@Param('id') id: string): Promise<CursoRespostaDto> {
    const curso = await this.cursosService.buscarPorId(id);
    return new CursoRespostaDto(curso);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar curso pelo ID' })
  @ApiOkResponse({
    description: 'O curso foi atualizado com sucesso.',
    type: CursoRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Curso não encontrado.',
  })
  @ApiConflictResponse({
    description: 'Já existe um curso cadastrado com este nome.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar o curso.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarCursoDto: AtualizarCursoDto,
  ): Promise<CursoRespostaDto> {
    const cursoAtualizado = await this.cursosService.atualizar(
      id,
      atualizarCursoDto,
    );
    return new CursoRespostaDto(cursoAtualizado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar curso pelo ID' })
  @ApiNoContentResponse({
    description: 'O curso foi deletado com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Curso não encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao deletar o curso.',
  })
  async remover(@Param('id') id: string): Promise<void> {
    await this.cursosService.remover(id);
  }
}
