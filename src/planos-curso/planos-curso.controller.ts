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

import { AtualizarPlanoCursoDto } from './dto/atualizar-planos-curso.dto';
import { CriarPlanoCursoDto } from './dto/criar-plano-curso.dto';
import { PlanoCursoRespostaDto } from './dto/plano-curso-resposta.dto';
import { PlanosCursoService } from './planos-curso.service';
import {
  ApiDocAtualizarPlanoCurso,
  ApiDocBuscarPlanoCursoPorId,
  ApiDocBuscarPlanosCurso,
  ApiDocCriarPlanoCurso,
  ApiDocRemoverPlanoCurso,
} from './planos-curso.swagger';

@ApiTags('Planos de Curso')
@Controller('planos-curso')
export class PlanosCursoController {
  constructor(private readonly planosCursoService: PlanosCursoService) {}

  @Post()
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @ApiDocCriarPlanoCurso()
  async criar(
    @Body() criarPlanoCursoDto: CriarPlanoCursoDto,
  ): Promise<PlanoCursoRespostaDto> {
    const planoCurso = await this.planosCursoService.criar(criarPlanoCursoDto);
    return new PlanoCursoRespostaDto(planoCurso);
  }

  @Get()
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
  @ApiDocBuscarPlanosCurso()
  async buscarTodos(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('itensPorPagina', new DefaultValuePipe(10), ParseIntPipe)
    itensPorPagina: number,
    @UsuarioLogado() usuario: PayloadJwtDto,
    @Query('cursoId') cursoId?: string,
  ): Promise<PaginacaoRespostaDto<PlanoCursoRespostaDto>> {
    const planosCursoPaginados = await this.planosCursoService.buscarTodos(
      usuario,
      pagina,
      itensPorPagina,
      cursoId,
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
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
  @ApiDocBuscarPlanoCursoPorId()
  async buscarPorId(
    @Param('id') id: string,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<PlanoCursoRespostaDto> {
    const planoCurso = await this.planosCursoService.buscarPorId(id, usuario);
    return new PlanoCursoRespostaDto(planoCurso);
  }

  @Patch(':id')
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @ApiDocAtualizarPlanoCurso()
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarPlanoCursoDto: AtualizarPlanoCursoDto,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<PlanoCursoRespostaDto> {
    const planoCurso = await this.planosCursoService.atualizar(
      id,
      atualizarPlanoCursoDto,
      usuario,
    );
    return new PlanoCursoRespostaDto(planoCurso);
  }

  @Delete(':id')
  @Perfis(PerfilAcesso.COORDENADOR_CURSOS)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDocRemoverPlanoCurso()
  async remover(@Param('id') id: string): Promise<void> {
    await this.planosCursoService.remover(id);
  }
}
