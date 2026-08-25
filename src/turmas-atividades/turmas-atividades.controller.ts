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
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('Atividades das Turmas')
@Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
@Controller('turmas-atividades')
export class TurmasAtividadesController {
  constructor(
    private readonly turmasAtividadesService: TurmasAtividadesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar uma nova atividade para uma turma' })
  @ApiCreatedResponse({
    description:
      'A atividade foi cadastrada com sucesso e as pendências de entrega de todos os alunos ativos foram inicializadas.',
    type: TurmaAtividadeRespostaDto,
  })
  @ApiBadRequestResponse({
    description:
      'Houve quebra nas regras de consistência de datas (fora do limite da turma) ou tentativa de atribuir nota em turmas com critérios qualitativos/livres.',
  })
  @ApiNotFoundResponse({
    description: 'A turma informada no id não existe no sistema.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Ocorreu um erro inesperado ao processar a criação da atividade em lote.',
  })
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
  @ApiOperation({
    summary: 'Buscar todas as atividades de uma turma específica',
  })
  @ApiOkResponse({
    description: 'A lista de atividades da turma foi recuperada com sucesso.',
    type: [TurmaAtividadeRespostaDto],
  })
  @ApiNotFoundResponse({
    description: 'A turma informada no id não existe no sistema.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar as atividades da turma.',
  })
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
  @ApiOperation({
    summary: 'Buscar todas as entregas e notas de alunos por atividade',
  })
  @ApiOkResponse({
    description:
      'A lista de entregas dos alunos da atividade foi encontrada com sucesso.',
    type: [TurmaAtividadeEntregaRespostaDto],
  })
  @ApiNotFoundResponse({
    description: 'A atividade com o ID especificado não foi encontrada.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao carregar o painel de entregas.',
  })
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
  @ApiOperation({
    summary: 'Registrar notas e status de entregas de alunos em lote',
  })
  @ApiNoContentResponse({
    description:
      'O lote de avaliações e notas dos estudantes foi processado e salvo com sucesso.',
  })
  @ApiBadRequestResponse({
    description:
      'Tentativa de lançar nota em atividade não avaliativa ou a nota informada ultrapassou o limite máximo da atividade.',
  })
  @ApiNotFoundResponse({
    description:
      'Um ou mais IDs de registros de entregas informados na lista não foram localizados.',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Ocorreu um erro inesperado ou falha de transação ao processar o lote de notas.',
  })
  @ApiNoContentResponse({
    description:
      'O lote de avaliações e notas dos estudantes foi processado e salvo com sucesso.',
  })
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
  @ApiOperation({
    summary: 'Atualizar dados de uma atividade cadastrada',
  })
  @ApiOkResponse({
    description: 'A atividade foi atualizada com sucesso.',
    type: TurmaAtividadeRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Atividade com o ID especificado não foi encontrada.',
  })
  @ApiBadRequestResponse({
    description:
      'Houve quebra nas regras de consistência de datas, tentativa de atribuir nota em turmas com critérios não avaliativos ou tentativa de reduzir a nota máxima com notas já lançadas acima do novo limite.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar a atividade.',
  })
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
