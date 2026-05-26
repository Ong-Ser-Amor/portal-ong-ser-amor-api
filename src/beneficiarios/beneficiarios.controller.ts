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
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TipoContato } from 'src/contatos/enums/tipo-contato.enum';
import { ApiPaginacaoResposta } from 'src/dtos/api-paginacao-resposta.decorator';
import { PaginacaoRespostaDto } from 'src/dtos/paginacao-resposta.dto';

import { BeneficiariosService } from './beneficiarios.service';
import { AtualizarBeneficiarioDto } from './dto/atualizar-beneficiario.dto';
import { BeneficiarioRespostaDto } from './dto/beneficiario-resposta.dto';
import { CriarBeneficiarioDto } from './dto/criar-beneficiario.dto';
import { TransferirFamiliaDto } from './dto/transferir-familia.dto';
import {
  EstadoCivil,
  NivelEscolaridade,
  VinculoEmpregaticio,
} from './enums/beneficiario.enum';

@ApiTags('Beneficiarios')
@Controller('beneficiarios')
export class BeneficiariosController {
  constructor(private readonly beneficiariosService: BeneficiariosService) {}

  @ApiBody({
    description: `Existem 2 cenários:\n1) Se a pessoa JÁ É cadastrada: envie 'pessoaId' (não envie 'nome', 'cpf' ou 'dataNascimento') + os campos do beneficiário.\n2) Se a pessoa NÃO possui cadastro de pessoa: envie 'nome', 'cpf' e 'dataNascimento' + os campos do beneficiário (não envie 'pessoaId'). Em ambos os casos você pode informar 'familiaId' ou os dados de 'novaFamilia'.`,
    schema: {
      oneOf: [
        {
          type: 'object',
          title: 'Pessoa existente + família existente',
          properties: {
            pessoaId: { type: 'string', example: '123456' },
            emancipado: { type: 'boolean', example: false },
            podeSairSozinho: { type: 'boolean', example: true },
            responsavelId: { type: 'string', example: '10' },
            estadoCivil: {
              type: 'string',
              enum: Object.values(EstadoCivil),
            },
            vinculoEmpregaticio: {
              type: 'string',
              enum: Object.values(VinculoEmpregaticio),
            },
            quantidadeFilhos: { type: 'number', example: 2 },
            nivelEscolaridade: {
              type: 'string',
              enum: Object.values(NivelEscolaridade),
            },
            familiaId: { type: 'string', example: '789012' },
            contatos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tipoContato: {
                    type: 'string',
                    enum: Object.values(TipoContato),
                  },
                  valor: { type: 'string' },
                },
              },
            },
          },
          required: ['pessoaId', 'familiaId', 'nivelEscolaridade'],
        },
        {
          type: 'object',
          title: 'Pessoa existente + criar nova família',
          properties: {
            pessoaId: { type: 'string', example: '123456' },
            emancipado: { type: 'boolean', example: false },
            podeSairSozinho: { type: 'boolean', example: true },
            responsavelId: { type: 'string', example: '10' },
            estadoCivil: {
              type: 'string',
              enum: Object.values(EstadoCivil),
            },
            vinculoEmpregaticio: {
              type: 'string',
              enum: Object.values(VinculoEmpregaticio),
            },
            quantidadeFilhos: { type: 'number', example: 2 },
            nivelEscolaridade: {
              type: 'string',
              enum: Object.values(NivelEscolaridade),
            },
            novaFamilia: { $ref: '#/components/schemas/CriarFamiliaDto' },
            contatos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tipoContato: {
                    type: 'string',
                    enum: Object.values(TipoContato),
                  },
                  valor: { type: 'string' },
                },
              },
            },
          },
          required: ['pessoaId', 'novaFamilia', 'nivelEscolaridade'],
        },
        {
          type: 'object',
          title: 'Nova pessoa + família existente',
          properties: {
            nome: { type: 'string', example: 'João da Silva' },
            cpf: {
              type: 'string',
              example: '12345678900',
              minLength: 11,
              maxLength: 11,
            },
            dataNascimento: {
              type: 'string',
              format: 'date',
              example: '1990-01-01',
            },
            emancipado: { type: 'boolean', example: false },
            podeSairSozinho: { type: 'boolean', example: true },
            responsavelId: { type: 'string', example: '10' },
            estadoCivil: {
              type: 'string',
              enum: Object.values(EstadoCivil),
            },
            vinculoEmpregaticio: {
              type: 'string',
              enum: Object.values(VinculoEmpregaticio),
            },
            quantidadeFilhos: { type: 'number', example: 2 },
            nivelEscolaridade: {
              type: 'string',
              enum: Object.values(NivelEscolaridade),
            },
            familiaId: { type: 'string', example: '789012' },
            contatos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tipoContato: {
                    type: 'string',
                    enum: Object.values(TipoContato),
                  },
                  valor: { type: 'string' },
                },
              },
            },
          },
          required: [
            'nome',
            'cpf',
            'dataNascimento',
            'familiaId',
            'nivelEscolaridade',
          ],
        },
        {
          type: 'object',
          title: 'Nova pessoa + criar nova família',
          properties: {
            nome: { type: 'string', example: 'João da Silva' },
            cpf: {
              type: 'string',
              example: '12345678900',
              minLength: 11,
              maxLength: 11,
            },
            dataNascimento: {
              type: 'string',
              format: 'date',
              example: '1990-01-01',
            },
            emancipado: { type: 'boolean', example: false },
            podeSairSozinho: { type: 'boolean', example: true },
            responsavelId: { type: 'string', example: '10' },
            estadoCivil: {
              type: 'string',
              enum: Object.values(EstadoCivil),
            },
            vinculoEmpregaticio: {
              type: 'string',
              enum: Object.values(VinculoEmpregaticio),
            },
            quantidadeFilhos: { type: 'number', example: 2 },
            nivelEscolaridade: {
              type: 'string',
              enum: Object.values(NivelEscolaridade),
            },
            novaFamilia: { $ref: '#/components/schemas/CriarFamiliaDto' },
            contatos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tipoContato: {
                    type: 'string',
                    enum: Object.values(TipoContato),
                  },
                  valor: { type: 'string' },
                },
              },
            },
          },
          required: [
            'nome',
            'cpf',
            'dataNascimento',
            'novaFamilia',
            'nivelEscolaridade',
          ],
        },
      ],
    },
    examples: {
      pessoa_existente_familia_existente: {
        summary: 'Pessoa existente + família existente',
        value: {
          pessoaId: '123456',
          familiaId: '789012',
          emancipado: false,
          podeSairSozinho: true,
          responsavelId: '10',
          estadoCivil: 'SOLTEIRO',
          vinculoEmpregaticio: 'DESEMPREGADO',
          quantidadeFilhos: 2,
          nivelEscolaridade: 'ENSINO_FUNDAMENTAL_COMPLETO',
          contatos: [
            {
              tipoContato: 'CELULAR',
              valor: '11999998888',
            },
          ],
        },
      },
      pessoa_existente_nova_familia: {
        summary: 'Pessoa existente + criar nova família',
        value: {
          pessoaId: '123456',
          emancipado: false,
          podeSairSozinho: true,
          responsavelId: '10',
          estadoCivil: 'SOLTEIRO',
          vinculoEmpregaticio: 'DESEMPREGADO',
          quantidadeFilhos: 2,
          contatos: [
            {
              tipoContato: 'CELULAR',
              valor: '11999998888',
            },
          ],
          novaFamilia: {
            faixaRenda: 'DE_1_A_3_SALARIOS_MINIMOS',
            possuiBeneficioSocial: true,
            tipoMoradia: 'ALUGADA',
            endereco: {
              cep: '12345678',
              logradouro: 'Rua A',
              numero: '123',
              bairro: 'Centro',
              cidade: 'Cidade',
              estado: 'SP',
            },
          },
          nivelEscolaridade: 'ENSINO_FUNDAMENTAL_COMPLETO',
        },
      },
      pessoa_nova_familia_existente: {
        summary: 'Nova pessoa + família existente',
        value: {
          nome: 'João da Silva',
          cpf: '12345678900',
          dataNascimento: '1990-01-01',
          familiaId: '789012',
          emancipado: false,
          podeSairSozinho: true,
          responsavelId: '10',
          estadoCivil: 'SOLTEIRO',
          vinculoEmpregaticio: 'DESEMPREGADO',
          quantidadeFilhos: 2,
          contatos: [
            {
              tipoContato: 'CELULAR',
              valor: '11999998888',
            },
          ],
          nivelEscolaridade: 'ENSINO_FUNDAMENTAL_COMPLETO',
        },
      },
      pessoa_nova_nova_familia: {
        summary: 'Nova pessoa + criar nova família',
        value: {
          nome: 'João da Silva',
          cpf: '12345678900',
          dataNascimento: '1990-01-01',
          emancipado: false,
          podeSairSozinho: true,
          responsavelId: '10',
          estadoCivil: 'SOLTEIRO',
          vinculoEmpregaticio: 'DESEMPREGADO',
          quantidadeFilhos: 2,
          contatos: [
            {
              tipoContato: 'CELULAR',
              valor: '11999998888',
            },
          ],
          novaFamilia: {
            faixaRenda: 'DE_1_A_3_SALARIOS_MINIMOS',
            possuiBeneficioSocial: true,
            tipoMoradia: 'ALUGADA',
            endereco: {
              cep: '12345678',
              logradouro: 'Rua A',
              numero: '123',
              bairro: 'Centro',
              cidade: 'Cidade',
              estado: 'SP',
            },
          },
          nivelEscolaridade: 'ENSINO_FUNDAMENTAL_COMPLETO',
        },
      },
    },
  })
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

  @Patch(':id/transferir-familia')
  @ApiBody({
    description: `Envie o 'familiaId' de destino OU os dados de 'novaFamilia' para criar a família de destino.`,
    schema: {
      oneOf: [
        {
          type: 'object',
          title: 'Família existente',
          properties: {
            familiaId: { type: 'string', example: '123' },
          },
          required: ['familiaId'],
        },
        {
          type: 'object',
          title: 'Criar nova família',
          properties: {
            novaFamilia: { $ref: '#/components/schemas/CriarFamiliaDto' },
          },
          required: ['novaFamilia'],
        },
      ],
    },
    examples: {
      existingFamily: {
        summary: 'Usar família já existente',
        value: { familiaId: '123' },
      },
      newFamily: {
        summary: 'Criar nova família',
        value: {
          novaFamilia: {
            faixaRenda: 'DE_1_A_3_SALARIOS_MINIMOS',
            possuiBeneficioSocial: true,
            tipoMoradia: 'ALUGADA',
            endereco: {
              cep: '12345678',
              logradouro: 'Rua A',
              numero: '123',
              bairro: 'Centro',
              cidade: 'Cidade',
              estado: 'SP',
            },
          },
        },
      },
    },
  })
  @ApiOperation({
    summary:
      'Transfere o beneficiário para uma nova família (existente ou recém-criada)',
  })
  @ApiOkResponse({
    description: 'O beneficiário foi transferido com sucesso.',
    type: BeneficiarioRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Beneficiário ou família destino não encontrados.',
  })
  @ApiBadRequestResponse({
    description:
      'O beneficiário já pertence a esta família ou os dados enviados são inválidos.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao transferir o beneficiário.',
  })
  async transferirFamilia(
    @Param('id') id: string,
    @Body() transferirFamiliaDto: TransferirFamiliaDto,
  ): Promise<BeneficiarioRespostaDto> {
    const beneficiarioAtualizado =
      await this.beneficiariosService.transferirFamilia(
        id,
        transferirFamiliaDto,
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
