import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  DefaultValuePipe,
  Query,
  HttpCode,
  HttpStatus,
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
import { ApiPaginacaoResposta } from 'src/dtos/api-paginacao-resposta.decorator';
import { PaginacaoRespostaDto } from 'src/dtos/paginacao-resposta.dto';

import { AtualizarPlanoCursoDto } from './dto/atualizar-planos-curso.dto';
import { CriarPlanoCursoDto } from './dto/criar-plano-curso.dto';
import { PlanoCursoRespostaDto } from './dto/plano-curso-resposta.dto';
import { PlanosCursoService } from './planos-curso.service';

@ApiTags('Planos de Curso')
@Controller('planos-curso')
export class PlanosCursoController {
  constructor(private readonly planosCursoService: PlanosCursoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo plano de curso' })
  @ApiCreatedResponse({
    description: 'O plano de curso foi criado com sucesso.',
    type: PlanoCursoRespostaDto,
  })
  @ApiConflictResponse({
    description: 'Já existe um plano de curso cadastrado com este nome.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao criar o plano de curso.',
  })
  async criar(
    @Body() criarPlanoCursoDto: CriarPlanoCursoDto,
  ): Promise<PlanoCursoRespostaDto> {
    const planoCurso = await this.planosCursoService.criar(criarPlanoCursoDto);
    return new PlanoCursoRespostaDto(planoCurso);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar uma lista paginada de planos de curso' })
  @ApiPaginacaoResposta(PlanoCursoRespostaDto)
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
    description: 'Ocorreu um erro inesperado ao buscar os planos de curso.',
  })
  async buscarTodos(
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number,
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
  ): Promise<PaginacaoRespostaDto<PlanoCursoRespostaDto>> {
    const planosCursoPaginados = await this.planosCursoService.buscarTodos(
      limite,
      pagina,
    );

    const planosCursoResposta = planosCursoPaginados.dados.map(
      (planoCurso) => new PlanoCursoRespostaDto(planoCurso),
    );

    return new PaginacaoRespostaDto<PlanoCursoRespostaDto>(
      planosCursoResposta,
      planosCursoPaginados.meta.totalItens,
      planosCursoPaginados.meta.itensPorPagina,
      planosCursoPaginados.meta.paginaAtual,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um plano de curso pelo ID' })
  @ApiOkResponse({
    description: 'O plano de curso foi encontrado com sucesso.',
    type: PlanoCursoRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Plano de curso com o ID especificado não encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar o plano de curso.',
  })
  async buscarPorId(@Param('id') id: string): Promise<PlanoCursoRespostaDto> {
    const planoCurso = await this.planosCursoService.buscarPorId(id);
    return new PlanoCursoRespostaDto(planoCurso);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um plano de curso pelo ID' })
  @ApiOkResponse({
    description: 'O plano de curso foi atualizado com sucesso.',
    type: PlanoCursoRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Plano de curso com o ID especificado não encontrado.',
  })
  @ApiConflictResponse({
    description: 'Já existe um plano de curso cadastrado com este nome.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar o plano de curso.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarPlanoCursoDto: AtualizarPlanoCursoDto,
  ) {
    const planoCurso = await this.planosCursoService.atualizar(
      id,
      atualizarPlanoCursoDto,
    );
    return new PlanoCursoRespostaDto(planoCurso);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar um plano de curso pelo ID' })
  @ApiNoContentResponse({
    description: 'O plano de curso foi removido com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Plano de curso com o ID especificado não encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao remover o plano de curso.',
  })
  async remover(@Param('id') id: string): Promise<void> {
    await this.planosCursoService.remover(id);
  }
}
