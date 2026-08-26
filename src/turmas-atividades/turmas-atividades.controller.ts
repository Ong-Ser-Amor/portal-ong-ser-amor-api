import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { PayloadJwtDto } from 'src/autenticacao/dto/payload-jwt.dto';
import { Perfis } from 'src/shared/decorators/perfis.decorator';
import { UsuarioLogado } from 'src/shared/decorators/usuario-logado.decorator';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

import { AtualizarTurmaAtividadeDto } from './dto/atualizar-turma-atividade.dto';
import { CriarTurmaAtividadeDto } from './dto/criar-turma-atividade.dto';
import { RegistrarEntregasLoteDto } from './dto/registrar-entregas-lote.dto';
import { TurmaAtividadeEntregaRespostaDto } from './dto/turma-atividade-entrega-resposta.dto';
import { TurmaAtividadeRespostaDto } from './dto/turma-atividade-resposta.dto';
import { TurmasAtividadesService } from './turmas-atividades.service';
import {
  ApiDocAtualizarTurmaAtividade,
  ApiDocBuscarAtividadesPorTurma,
  ApiDocBuscarEntregasPorAtividade,
  ApiDocCriarTurmaAtividade,
  ApiDocRegistrarEntregasEmLote,
} from './turmas-atividades.swagger';

@ApiTags('Atividades das Turmas')
@ApiForbiddenResponse({
  description:
    'Usuário não tem permissão para acessar ou manipular atividades desta turma.',
})
@Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
@Controller('turmas-atividades')
export class TurmasAtividadesController {
  constructor(
    private readonly turmasAtividadesService: TurmasAtividadesService,
  ) {}

  @Post()
  @ApiDocCriarTurmaAtividade()
  async criar(
    @Body() criarTurmaAtividadeDto: CriarTurmaAtividadeDto,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<TurmaAtividadeRespostaDto> {
    const atividade =
      await this.turmasAtividadesService.criarAtividadeComPendenciasDeEntrega(
        criarTurmaAtividadeDto,
        usuario,
      );
    return new TurmaAtividadeRespostaDto(atividade);
  }

  @Get('turmas/:turmaId')
  @ApiDocBuscarAtividadesPorTurma()
  async buscarAtividadesPorTurma(
    @Param('turmaId') turmaId: string,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<TurmaAtividadeRespostaDto[]> {
    const atividades =
      await this.turmasAtividadesService.buscarAtividadesPorTurma(
        turmaId,
        usuario,
      );
    return atividades.map(
      (atividade) => new TurmaAtividadeRespostaDto(atividade),
    );
  }

  @Get(':atividadeId/entregas')
  @ApiDocBuscarEntregasPorAtividade()
  async buscarEntregasPorAtividade(
    @Param('atividadeId') atividadeId: string,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<TurmaAtividadeEntregaRespostaDto[]> {
    const entregas =
      await this.turmasAtividadesService.buscarEntregasPorAtividade(
        atividadeId,
        usuario,
      );
    return entregas.map(
      (entrega) => new TurmaAtividadeEntregaRespostaDto(entrega),
    );
  }

  @Patch('entregas/lote')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDocRegistrarEntregasEmLote()
  async registrarEmLote(
    @Body() registrarEntregasLoteDto: RegistrarEntregasLoteDto,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<void> {
    await this.turmasAtividadesService.registrarEntregasEmLote(
      registrarEntregasLoteDto,
      usuario,
    );
  }

  @Patch(':id')
  @ApiDocAtualizarTurmaAtividade()
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarTurmaAtividadeDto: AtualizarTurmaAtividadeDto,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<TurmaAtividadeRespostaDto> {
    const atividade = await this.turmasAtividadesService.atualizar(
      id,
      atualizarTurmaAtividadeDto,
      usuario,
    );
    return new TurmaAtividadeRespostaDto(atividade);
  }
}
