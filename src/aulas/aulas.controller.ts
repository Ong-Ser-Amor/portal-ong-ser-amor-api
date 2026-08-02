import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
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
import { ApiPaginacaoResposta } from 'src/shared/decorators/api-paginacao-resposta.decorator';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';

import { AulasService } from './aulas.service';
import { AtualizarAulaDto } from './dto/atualizar-aula.dto';
import { AulaRespostaDto } from './dto/aula-resposta.dto';
import { CriarAulaDto } from './dto/criar-aula.dto';

@ApiTags('Aulas')
@Controller('aulas')
export class AulasController {
  constructor(private readonly aulasService: AulasService) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastrar ou agendar uma nova aula para uma turma',
  })
  @ApiCreatedResponse({
    description: 'A aula foi cadastrada com sucesso.',
    type: AulaRespostaDto,
  })
  @ApiBadRequestResponse({
    description:
      'A turma não está EM_ANDAMENTO ou a data enviada está fora do período letivo estabelecido.',
  })
  @ApiConflictResponse({
    description:
      'Já existe uma aula cadastrada nesta mesma data para a turma informada.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao cadastrar a aula.',
  })
  async criar(@Body() criarAulaDto: CriarAulaDto): Promise<AulaRespostaDto> {
    const aula = await this.aulasService.criar(criarAulaDto);
    return new AulaRespostaDto(aula);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar uma lista paginada de aulas registradas' })
  @ApiPaginacaoResposta(AulaRespostaDto)
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
  @ApiQuery({
    name: 'turmaId',
    required: false,
    description:
      'Filtra opcionalmente as aulas pertencentes a uma turma específica',
    example: '1',
  })
  @ApiBadRequestResponse({
    description:
      'Os parâmetros de paginação (página ou itensPorPagina) devem ser maiores ou iguais a 1.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar a listagem de aulas.',
  })
  async buscarTodas(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('itensPorPagina', new DefaultValuePipe(10), ParseIntPipe)
    itensPorPagina: number,
    @Query('turmaId') turmaId?: string,
  ): Promise<PaginacaoRespostaDto<AulaRespostaDto>> {
    const aulas = await this.aulasService.buscarTodas(
      pagina,
      itensPorPagina,
      turmaId,
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
  @ApiOperation({ summary: 'Buscar o registro de uma aula por ID' })
  @ApiOkResponse({
    description: 'A aula foi encontrada com sucesso.',
    type: AulaRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Aula com o ID especificado não foi encontrada.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar a aula.',
  })
  async buscarPorId(@Param('id') id: string): Promise<AulaRespostaDto> {
    const aula = await this.aulasService.buscarPorId(id);
    return new AulaRespostaDto(aula);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados ou o status de uma aula pelo ID' })
  @ApiOkResponse({
    description: 'O registro da aula foi updated com sucesso.',
    type: AulaRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Aula com o ID especificado não foi encontrada.',
  })
  @ApiBadRequestResponse({
    description:
      'A nova data ultrapassa os limites do curso, a data é duplicada, tentou-se reverter uma aula com chamada para AGENDADA/CANCELADA, ou marcar como REALIZADA sem lista de presença salva.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar a aula.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarAulaDto: AtualizarAulaDto,
  ): Promise<AulaRespostaDto> {
    const aula = await this.aulasService.atualizar(id, atualizarAulaDto);
    return new AulaRespostaDto(aula);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover logicamente uma aula do cronograma pelo ID',
  })
  @ApiNoContentResponse({
    description: 'A aula foi removida com sucesso (soft delete).',
  })
  @ApiBadRequestResponse({
    description:
      'Esta aula não pode ser removida pois possui um lote de chamadas ativo e vinculado a ela.',
  })
  @ApiNotFoundResponse({
    description: 'Aula com o ID especificado não foi encontrada.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao remover a aula.',
  })
  async remover(@Param('id') id: string): Promise<void> {
    await this.aulasService.remover(id);
  }
}
