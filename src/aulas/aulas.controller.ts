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
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { PayloadJwtDto } from 'src/autenticacao/dto/payload-jwt.dto';
import { Perfis } from 'src/shared/decorators/perfis.decorator';
import { UsuarioLogado } from 'src/shared/decorators/usuario-logado.decorator';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

import { AulasService } from './aulas.service';
import {
  ApiDocAtualizarAula,
  ApiDocBuscarAulaPorId,
  ApiDocBuscarAulas,
  ApiDocCriarAula,
  ApiDocRemoverAula,
} from './aulas.swagger';
import { AtualizarAulaDto } from './dto/atualizar-aula.dto';
import { AulaRespostaDto } from './dto/aula-resposta.dto';
import { CriarAulaDto } from './dto/criar-aula.dto';

@ApiTags('Aulas')
@ApiForbiddenResponse({
  description:
    'Usuário não tem permissão para acessar ou manipular dados das aulas desta turma.',
})
@Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
@Controller('aulas')
export class AulasController {
  constructor(private readonly aulasService: AulasService) {}

  @Post()
  @ApiDocCriarAula()
  async criar(
    @Body() criarAulaDto: CriarAulaDto,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<AulaRespostaDto> {
    const aula = await this.aulasService.criar(criarAulaDto, usuario);
    return new AulaRespostaDto(aula);
  }

  @Get()
  @ApiDocBuscarAulas()
  async buscarTodas(
    @Query('turmaId') turmaId: string,
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('itensPorPagina', new DefaultValuePipe(10), ParseIntPipe)
    itensPorPagina: number,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<PaginacaoRespostaDto<AulaRespostaDto>> {
    const aulas = await this.aulasService.buscarTodas(
      turmaId,
      usuario,
      pagina,
      itensPorPagina,
    );

    const aulasMapeadas = aulas.dados.map((aula) => new AulaRespostaDto(aula));

    return new PaginacaoRespostaDto<AulaRespostaDto>(
      aulasMapeadas,
      aulas.meta.totalItens,
      aulas.meta.itensPorPagina,
      aulas.meta.paginaAtual,
    );
  }

  @Get(':id')
  @ApiDocBuscarAulaPorId()
  async buscarPorId(
    @Param('id') id: string,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<AulaRespostaDto> {
    const aula = await this.aulasService.buscarPorId(id, usuario);
    return new AulaRespostaDto(aula);
  }

  @Patch(':id')
  @ApiDocAtualizarAula()
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarAulaDto: AtualizarAulaDto,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<AulaRespostaDto> {
    const aula = await this.aulasService.atualizar(
      id,
      atualizarAulaDto,
      usuario,
    );
    return new AulaRespostaDto(aula);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDocRemoverAula()
  async remover(
    @Param('id') id: string,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<void> {
    await this.aulasService.remover(id, usuario);
  }
}
