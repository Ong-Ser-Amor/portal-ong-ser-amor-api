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

import { AtualizarTurmaMatriculaDto } from './dto/atualizar-turma-matricula.dto';
import { CriarTurmaMatriculaDto } from './dto/criar-turma-matricula.dto';
import { TurmaMatriculaRespostaDto } from './dto/turma-matricula-resposta.dto';
import { TurmasMatriculasService } from './turmas-matriculas.service';
import {
  ApiDocAtualizarTurmaMatricula,
  ApiDocBuscarTurmaMatriculaPorId,
  ApiDocBuscarTurmasMatriculas,
  ApiDocCriarTurmaMatricula,
  ApiDocRemoverTurmaMatricula,
} from './turmas-matriculas.swagger';

@ApiTags('Matrículas das Turmas')
@Controller('turmas-matriculas')
export class TurmasMatriculasController {
  constructor(
    private readonly turmasMatriculasService: TurmasMatriculasService,
  ) {}

  @Post()
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @ApiDocCriarTurmaMatricula()
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
  @ApiDocBuscarTurmasMatriculas()
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
  @ApiDocBuscarTurmaMatriculaPorId()
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
  @ApiDocAtualizarTurmaMatricula()
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
  @ApiDocRemoverTurmaMatricula()
  async remover(@Param('id') id: string): Promise<void> {
    await this.turmasMatriculasService.remover(id);
  }
}
