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
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PessoaDto } from 'src/pessoas/dto/pessoa.dto';
import { ApiPaginacaoResposta } from 'src/shared/decorators/api-paginacao-resposta.decorator';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { ValidarCpfPipe } from 'src/shared/pipes/validar-cpf.pipe';

import { AtualizarVoluntarioDto } from './dto/atualizar-voluntario.dto';
import { CriarVoluntarioDto } from './dto/criar-voluntario.dto';
import { VoluntarioResumoDto } from './dto/voluntario-resumo.dto';
import { VoluntarioDto } from './dto/voluntario.dto';
import { StatusFormacao, TipoVoluntario } from './enums/voluntario.enum';
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
              enum: Object.values(TipoVoluntario),
            },
            formacaoAcademica: { type: 'string', example: 'Pedagogia' },
            statusFormacao: {
              type: 'string',
              enum: Object.values(StatusFormacao),
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
              enum: Object.values(TipoVoluntario),
            },
            formacaoAcademica: { type: 'string', example: 'Pedagogia' },
            statusFormacao: {
              type: 'string',
              enum: Object.values(StatusFormacao),
            },
          },
          required: ['nome', 'cpf', 'dataNascimento', 'tipoVoluntario'],
        },
      ],
    },
    examples: {
      pessoa_existente: {
        summary: 'Pessoa já cadastrada (use pessoaId)',
        value: {
          pessoaId: '123456',
          tipoVoluntario: TipoVoluntario.COORDENADOR,
          formacaoAcademica: 'Pedagogia',
          statusFormacao: StatusFormacao.COMPLETO,
        },
      },
      pessoa_nova: {
        summary: 'Pessoa nova (envia dados da pessoa)',
        value: {
          nome: 'Carlos Santos',
          cpf: '12345678900',
          dataNascimento: '2000-01-01',
          tipoVoluntario: TipoVoluntario.PROFESSOR,
          formacaoAcademica: 'Pedagogia',
          statusFormacao: StatusFormacao.COMPLETO,
        },
      },
    },
  })
  @Post()
  @ApiOperation({ summary: 'Criar um novo voluntário' })
  @ApiCreatedResponse({
    description: 'O voluntário foi criado com sucesso.',
    type: VoluntarioDto,
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
  ): Promise<VoluntarioDto> {
    const voluntarioCriado =
      await this.voluntariosService.criar(criarVoluntarioDto);
    return new VoluntarioDto(voluntarioCriado);
  }

  @Get('verificar-cadastro/cpf/:cpf')
  @ApiOperation({
    summary: 'Verificar cadastro de voluntário pelo CPF',
  })
  @ApiParam({
    name: 'cpf',
    required: true,
    example: '12345678900',
    description: 'CPF com 11 dígitos numéricos.',
  })
  @ApiOkResponse({
    description: 'Pessoa encontrada com sucesso e sem voluntário vinculado.',
    type: PessoaDto,
  })
  @ApiBadRequestResponse({
    description: 'CPF inválido.',
  })
  @ApiNotFoundResponse({
    description: 'Pessoa não encontrada.',
  })
  @ApiConflictResponse({
    description: 'Pessoa já possui um cadastro de voluntário ativo.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno ao verificar o cadastro de voluntário.',
  })
  async verificarCadastroPorCpf(
    @Param('cpf', ValidarCpfPipe) cpf: string,
  ): Promise<PessoaDto> {
    const pessoa = await this.voluntariosService.verificarCadastroPorCpf(cpf);
    return new PessoaDto(pessoa);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar uma lista paginada de voluntários' })
  @ApiPaginacaoResposta(VoluntarioResumoDto)
  @ApiQuery({
    name: 'pagina',
    required: false,
    example: 1,
    description: 'Número da página atual (padrão: 1)',
  })
  @ApiQuery({
    name: 'itensPorPagina',
    required: false,
    example: 10,
    description: 'Número de itens por página (padrão: 10)',
  })
  @ApiQuery({
    name: 'nome',
    required: false,
    example: 'Carlos',
    description: 'Filtra voluntários por parte do nome da pessoa',
  })
  @ApiBadRequestResponse({
    description:
      'Os parâmetros de paginação (página ou itensPorPagina) devem ser maiores ou iguais a 1.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar os voluntários.',
  })
  async buscarTodos(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('itensPorPagina', new DefaultValuePipe(10), ParseIntPipe)
    itensPorPagina: number,
    @Query('nome') nome?: string,
  ): Promise<PaginacaoRespostaDto<VoluntarioResumoDto>> {
    const voluntariosPaginados = await this.voluntariosService.buscarTodos(
      pagina,
      itensPorPagina,
      nome,
    );

    const voluntariosDtos = voluntariosPaginados.dados.map(
      (voluntario) => new VoluntarioResumoDto(voluntario),
    );

    return new PaginacaoRespostaDto<VoluntarioResumoDto>(
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
    type: VoluntarioDto,
  })
  @ApiNotFoundResponse({
    description: 'Voluntário não encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar o voluntário.',
  })
  async buscarPorId(@Param('id') id: string): Promise<VoluntarioDto> {
    const voluntario = await this.voluntariosService.buscarPorId(id);
    return new VoluntarioDto(voluntario);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar voluntário pelo ID' })
  @ApiOkResponse({
    description: 'O voluntário foi atualizado com sucesso.',
    type: VoluntarioDto,
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
  ): Promise<VoluntarioDto> {
    const voluntarioAtualizado = await this.voluntariosService.atualizar(
      id,
      atualizarVoluntarioDto,
    );
    return new VoluntarioDto(voluntarioAtualizado);
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
