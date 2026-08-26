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

import { AtualizarTurmaDto } from './dto/atualizar-turma.dto';
import { CriarTurmaDto } from './dto/criar-turma.dto';
import { TurmaProfessorRespostaDto } from './dto/turma-professor-resposta.dto';
import { TurmaRespostaDto } from './dto/turma-resposta.dto';
import { TurmaResumoDto } from './dto/turma-resumo.dto';
import { VincularProfessorDto } from './dto/vincular-professor.dto';
import { TurmasService } from './turmas.service';
import {
  ApiDocAtualizarTurma,
  ApiDocBuscarTurmaPorId,
  ApiDocBuscarTurmas,
  ApiDocCriarTurma,
  ApiDocDesvincularProfessor,
  ApiDocRemoverTurma,
  ApiDocVincularProfessor,
} from './turmas.swagger';

@ApiTags('Turmas')
@Controller('turmas')
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  @Post()
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @ApiDocCriarTurma()
  async criar(@Body() criarTurmaDto: CriarTurmaDto): Promise<TurmaRespostaDto> {
    const turma = await this.turmasService.criar(criarTurmaDto);
    return new TurmaRespostaDto(turma);
  }

  @Get()
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
  @ApiDocBuscarTurmas()
  async buscarTodos(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('itensPorPagina', new DefaultValuePipe(10), ParseIntPipe)
    itensPorPagina: number,
    @UsuarioLogado() usuario: PayloadJwtDto,
    @Query('cursoId') cursoId?: string,
    @Query('planoCursoId') planoCursoId?: string,
  ): Promise<PaginacaoRespostaDto<TurmaResumoDto>> {
    const turmas = await this.turmasService.buscarTodos(
      usuario,
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
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
  @ApiDocBuscarTurmaPorId()
  async buscarPorId(
    @Param('id') id: string,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<TurmaRespostaDto> {
    const turma = await this.turmasService.buscarPorId(id, usuario);
    return new TurmaRespostaDto(turma);
  }

  @Patch(':id')
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @ApiDocAtualizarTurma()
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarTurmaDto: AtualizarTurmaDto,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<TurmaRespostaDto> {
    const turma = await this.turmasService.atualizar(
      id,
      atualizarTurmaDto,
      usuario,
    );
    return new TurmaRespostaDto(turma);
  }

  @Delete(':id')
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDocRemoverTurma()
  async remover(@Param('id') id: string): Promise<void> {
    await this.turmasService.remover(id);
  }

  @Post(':id/professores')
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @ApiDocVincularProfessor()
  async vincularProfessor(
    @Param('id') turmaId: string,
    @Body() vincularProfessorDto: VincularProfessorDto,
  ): Promise<TurmaProfessorRespostaDto> {
    const vinculo = await this.turmasService.vincularProfessor(
      turmaId,
      vincularProfessorDto,
    );
    return new TurmaProfessorRespostaDto(vinculo);
  }

  @Delete(':id/professores/:professorId')
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDocDesvincularProfessor()
  async desvincularProfessor(
    @Param('id') turmaId: string,
    @Param('professorId') professorId: string,
  ): Promise<void> {
    await this.turmasService.desvincularProfessor(turmaId, professorId);
  }
}
