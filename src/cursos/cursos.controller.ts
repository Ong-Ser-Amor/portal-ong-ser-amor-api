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
import { ApiTags } from '@nestjs/swagger';
import { PayloadJwtDto } from 'src/autenticacao/dto/payload-jwt.dto';
import { Perfis } from 'src/shared/decorators/perfis.decorator';
import { UsuarioLogado } from 'src/shared/decorators/usuario-logado.decorator';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

import { CursosService } from './cursos.service';
import {
  ApiDocAtualizarCurso,
  ApiDocBuscarCursoPorId,
  ApiDocBuscarCursos,
  ApiDocCriarCurso,
  ApiDocRemoverCurso,
} from './cursos.swagger';
import { AtualizarCursoDto } from './dto/atualizar-curso.dto';
import { CriarCursoDto } from './dto/criar-curso.dto';
import { CursoRespostaDto } from './dto/curso-resposta.dto';

@ApiTags('Cursos')
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @ApiDocCriarCurso()
  async criar(@Body() criarCursoDto: CriarCursoDto): Promise<CursoRespostaDto> {
    const cursoCriado = await this.cursosService.criar(criarCursoDto);
    return new CursoRespostaDto(cursoCriado);
  }

  @Get()
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
  @ApiDocBuscarCursos()
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
  @ApiDocBuscarCursoPorId()
  async buscarPorId(
    @Param('id') id: string,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<CursoRespostaDto> {
    const curso = await this.cursosService.buscarPorId(id, usuario);
    return new CursoRespostaDto(curso);
  }

  @Patch(':id')
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @ApiDocAtualizarCurso()
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
  @ApiDocRemoverCurso()
  async remover(@Param('id') id: string): Promise<void> {
    await this.cursosService.remover(id);
  }
}
