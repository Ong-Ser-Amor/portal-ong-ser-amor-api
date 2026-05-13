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
import { ApiPaginacaoResposta } from 'src/dtos/api-paginacao-resposta.decorator';
import { PaginacaoRespostaDto } from 'src/dtos/paginacao-resposta.dto';

import { BeneficiariosService } from './beneficiarios.service';
import { AtualizarBeneficiarioDto } from './dto/atualizar-beneficiario.dto';
import { BeneficiarioRespostaDto } from './dto/beneficiario-resposta.dto';
import { CriarBeneficiarioDto } from './dto/criar-beneficiario.dto';

@ApiTags('Beneficiarios')
@Controller('beneficiarios')
export class BeneficiariosController {
  constructor(private readonly beneficiariosService: BeneficiariosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo beneficiário' })
  @ApiCreatedResponse({
    description: 'O beneficiário foi criado com sucesso.',
    type: BeneficiarioRespostaDto,
  })
  @ApiConflictResponse({
    description:
      'Já existe uma pessoa com este CPF ou a pessoa informada já possui um benefício ativo.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao criar o beneficiário.',
  })
  async criar(
    @Body() criarBeneficiarioDto: CriarBeneficiarioDto,
  ): Promise<BeneficiarioRespostaDto> {
    const beneficiarioCriado =
      await this.beneficiariosService.criar(criarBeneficiarioDto);
    return new BeneficiarioRespostaDto(beneficiarioCriado);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar uma lista paginada de beneficiários' })
  @ApiPaginacaoResposta(BeneficiarioRespostaDto)
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    example: 10,
    description: 'Número de itens a serem retornados por página',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    example: 0,
    description: 'Número de itens a serem ignorados na consulta',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar os beneficiários.',
  })
  async buscarTodos(
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
  ): Promise<PaginacaoRespostaDto<BeneficiarioRespostaDto>> {
    const beneficiarios = await this.beneficiariosService.buscarTodos(
      take,
      skip,
    );

    const resposta = beneficiarios.dados.map(
      (beneficiario) => new BeneficiarioRespostaDto(beneficiario),
    );

    return new PaginacaoRespostaDto(
      resposta,
      beneficiarios.meta.totalItens,
      beneficiarios.meta.itensPorPagina,
      beneficiarios.meta.paginaAtual,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um beneficiário pelo ID' })
  @ApiOkResponse({
    description: 'O beneficiário foi encontrado com sucesso.',
    type: BeneficiarioRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Beneficiário não encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar o beneficiário.',
  })
  async buscarPorId(@Param('id') id: string): Promise<BeneficiarioRespostaDto> {
    const beneficiario = await this.beneficiariosService.buscarPorId(id);
    return new BeneficiarioRespostaDto(beneficiario);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados de um beneficiário' })
  @ApiOkResponse({
    description: 'O beneficiário foi atualizado com sucesso.',
    type: BeneficiarioRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Beneficiário não encontrado.',
  })
  @ApiConflictResponse({
    description: 'Já existe uma pessoa cadastrada com este CPF.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar o beneficiário.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarBeneficiarioDto: AtualizarBeneficiarioDto,
  ): Promise<BeneficiarioRespostaDto> {
    const beneficiarioAtualizado = await this.beneficiariosService.atualizar(
      id,
      atualizarBeneficiarioDto,
    );
    return new BeneficiarioRespostaDto(beneficiarioAtualizado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar beneficiário pelo ID' })
  @ApiNoContentResponse({
    description: 'O beneficiário foi deletado com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Beneficiário não encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao deletar o beneficiário.',
  })
  async remover(@Param('id') id: string): Promise<void> {
    await this.beneficiariosService.remover(id);
  }
}
