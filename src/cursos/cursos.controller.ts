import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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

import { CursosService } from './cursos.service';
import { AtualizarCursoDto } from './dto/atualizar-curso.dto';
import { CriarCursoDto } from './dto/criar-curso.dto';
import { CursoRespostaDto } from './dto/curso-resposta.dto';

@ApiTags('Cursos')
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
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
    const cursoCriado = await this.cursosService.criar(criarCursoDto);
    return new CursoRespostaDto(cursoCriado);
  }

  @Get()
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
  @ApiOperation({ summary: 'Buscar uma lista paginada de cursos' })
  @ApiPaginacaoResposta(CursoRespostaDto)
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
    description: 'Ocorreu um erro inesperado ao buscar os cursos.',
  })
  async buscarTodos(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('itensPorPagina', new DefaultValuePipe(10), ParseIntPipe)
    itensPorPagina: number,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<PaginacaoRespostaDto<CursoRespostaDto>> {
    const cursosPaginados = await this.cursosService.buscarTodos(
      usuario,
      pagina,
      itensPorPagina,
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
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
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
  async buscarPorId(
    @Param('id') id: string,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<CursoRespostaDto> {
    const curso = await this.cursosService.buscarPorId(id, usuario);
    return new CursoRespostaDto(curso);
  }

  @Patch(':id')
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
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
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<CursoRespostaDto> {
    const cursoAtualizado = await this.cursosService.atualizar(
      id,
      atualizarCursoDto,
      usuario,
    );
    return new CursoRespostaDto(cursoAtualizado);
  }

  @Delete(':id')
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
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
