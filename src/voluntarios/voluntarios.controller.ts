import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Publico } from '../decorators/publico.decorator';
import { ApiPaginacaoResposta } from '../dtos/api-paginacao-resposta.decorator';
import { PaginacaoRespostaDto } from '../dtos/paginacao-resposta.dto';
import { AtualizarVoluntarioDto } from './dto/atualizar-voluntario.dto';
import { CriarVoluntarioDto } from './dto/criar-voluntario.dto';
import { VoluntarioRespostaDto } from './dto/voluntario-resposta.dto';
import { VoluntariosService } from './voluntarios.service';

@ApiTags('Voluntarios')
@Controller('voluntarios')
export class VoluntariosController {
  constructor(private readonly voluntariosService: VoluntariosService) {}

  @Publico()
  @Post()
  @ApiOperation({ summary: 'Criar um novo voluntário' })
  @ApiCreatedResponse({
    description: 'O voluntário foi criado com sucesso.',
    type: VoluntarioRespostaDto,
  })
  @ApiConflictResponse({
    description: 'Já existe um voluntário com o mesmo CPF.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao criar o voluntário.',
  })
  async criar(
    @Body() criarVoluntarioDto: CriarVoluntarioDto,
  ): Promise<VoluntarioRespostaDto> {
    const voluntarioCriado =
      await this.voluntariosService.criar(criarVoluntarioDto);
    return new VoluntarioRespostaDto(voluntarioCriado);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar uma lista paginada de voluntários' })
  @ApiPaginacaoResposta(VoluntarioRespostaDto)
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar os voluntários.',
  })
  async buscarTodos(
    @Query('take') take = 10,
    @Query('skip') skip = 0,
  ): Promise<PaginacaoRespostaDto<VoluntarioRespostaDto>> {
    const voluntariosPaginados = await this.voluntariosService.buscarTodos(
      take,
      skip,
    );

    const voluntariosDtos = voluntariosPaginados.dados.map(
      (voluntario) => new VoluntarioRespostaDto(voluntario),
    );

    return new PaginacaoRespostaDto(
      voluntariosDtos,
      voluntariosPaginados.meta.totalItens,
      voluntariosPaginados.meta.itensPorPagina,
      voluntariosPaginados.meta.paginaAtual,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar voluntário pelo ID' })
  @ApiOkResponse({
    description: 'O voluntário foi encontrado com sucesso.',
    type: VoluntarioRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Voluntário não encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar o voluntário.',
  })
  async buscarPorId(@Param('id') id: string): Promise<VoluntarioRespostaDto> {
    const voluntario = await this.voluntariosService.buscarPorId(id);
    return new VoluntarioRespostaDto(voluntario);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar voluntário pelo ID' })
  @ApiOkResponse({
    description: 'O voluntário foi atualizado com sucesso.',
    type: VoluntarioRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Voluntário não encontrado.',
  })
  @ApiConflictResponse({
    description: 'Já existe um voluntário com o mesmo CPF.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar o voluntário.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarVoluntarioDto: AtualizarVoluntarioDto,
  ): Promise<VoluntarioRespostaDto> {
    const voluntarioAtualizado = await this.voluntariosService.atualizar(
      id,
      atualizarVoluntarioDto,
    );
    return new VoluntarioRespostaDto(voluntarioAtualizado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar voluntário pelo ID' })
  @ApiNoContentResponse({
    description: 'O voluntário foi deletado com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Voluntário não encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao deletar o voluntário.',
  })
  async remover(@Param('id') id: string): Promise<void> {
    await this.voluntariosService.remover(id);
  }
}
