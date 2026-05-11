import {
  DefaultValuePipe,
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
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

  @ApiBody({
    description: `Existem 2 cenários:\n1) Se o voluntário JÁ É beneficiário: envie 'pessoaId' (não envie 'nome', 'cpf' ou 'dataNascimento') + os campos do voluntário.\n2) Se o voluntário NÃO possui cadastro de pessoa: envie 'nome', 'cpf' e 'dataNascimento' + os campos do voluntário (não envie 'pessoaId').`,
    schema: {
      oneOf: [
        {
          type: 'object',
          title: 'Cenário com pessoa já cadastrada',
          properties: {
            pessoaId: { type: 'string', example: '123456' },
            tipoVoluntario: {
              type: 'string',
              enum: ['COORDENADOR', 'PROFESSOR', 'GERAL'],
            },
            formacaoAcademica: { type: 'string', example: 'Pedagogia' },
            statusFormacao: {
              type: 'string',
              enum: ['COMPLETO', 'CURSANDO', 'INCOMPLETO'],
            },
          },
          required: ['pessoaId', 'tipoVoluntario'],
        },
        {
          type: 'object',
          title: 'Cenário com nova pessoa',
          properties: {
            nome: { type: 'string', example: 'Carlos Santos' },
            cpf: {
              type: 'string',
              example: '12345678900',
              minLength: 11,
              maxLength: 11,
            },
            dataNascimento: {
              type: 'string',
              format: 'date',
              example: '2000-01-01',
            },
            tipoVoluntario: {
              type: 'string',
              enum: ['COORDENADOR', 'PROFESSOR', 'GERAL'],
            },
            formacaoAcademica: { type: 'string', example: 'Pedagogia' },
            statusFormacao: {
              type: 'string',
              enum: ['COMPLETO', 'CURSANDO', 'INCOMPLETO'],
            },
          },
          required: ['nome', 'cpf', 'dataNascimento', 'tipoVoluntario'],
        },
      ],
    },
    examples: {
      existingPerson: {
        summary: 'Pessoa já cadastrada (use pessoaId)',
        value: {
          pessoaId: '123456',
          tipoVoluntario: 'COORDENADOR',
          formacaoAcademica: 'Pedagogia',
          statusFormacao: 'COMPLETO',
        },
      },
      newPerson: {
        summary: 'Pessoa nova (envia dados da pessoa)',
        value: {
          nome: 'Carlos Santos',
          cpf: '12345678900',
          dataNascimento: '2000-01-01',
          tipoVoluntario: 'PROFESSOR',
          formacaoAcademica: 'Pedagogia',
          statusFormacao: 'COMPLETO',
        },
      },
    },
  })
  @Post()
  @ApiOperation({ summary: 'Criar um novo voluntário' })
  @ApiCreatedResponse({
    description: 'O voluntário foi criado com sucesso.',
    type: VoluntarioRespostaDto,
  })
  @ApiConflictResponse({
    description:
      'Já existe uma pessoa com este CPF ou a pessoa informada já possui um cadastro de voluntário ativo.',
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
    description: 'Ocorreu um erro inesperado ao buscar os voluntários.',
  })
  async buscarTodos(
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
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
    description: 'Já existe uma pessoa cadastrada com este CPF.',
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
