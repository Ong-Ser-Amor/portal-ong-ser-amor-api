import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { TipoContato } from 'src/contatos/enums/tipo-contato.enum';
import { CriarFamiliaDto } from 'src/familias/dto/criar-familia.dto';
import { FaixaRenda } from 'src/familias/enums/faixa-renda.enum';
import { TipoMoradia } from 'src/familias/enums/tipo-moradia.enum';
import { PessoaDto } from 'src/pessoas/dto/pessoa.dto';
import { ApiPaginacaoResposta } from 'src/shared/decorators/api-paginacao-resposta.decorator';

import { BeneficiarioResumoDto } from './dto/beneficiario-resumo.dto';
import { BeneficiarioDto } from './dto/beneficiario.dto';
import {
  EstadoCivil,
  NivelEscolaridade,
  VinculoEmpregaticio,
} from './enums/beneficiario.enum';

export function ApiDocCriarBeneficiario() {
  return applyDecorators(
    ApiExtraModels(CriarFamiliaDto),
    ApiBody({
      description: `Existem 2 cenários mutuamente exclusivos:\n1) Se a pessoa JÁ É cadastrada: envie 'pessoaId' + os campos do beneficiário. NENHUM dado de pessoa ('nome', 'cpf', 'dataNascimento', 'emancipado', 'podeSairSozinho', 'responsavelId') deve ser informado.\n2) Se a pessoa NÃO possui cadastro de pessoa: envie os dados cadastrais da pessoa ('nome', 'cpf', 'dataNascimento', etc.) + os campos do beneficiário (não envie 'pessoaId'). Em ambos os casos você pode informar 'familiaId' ou os dados de 'novaFamilia'.`,
      schema: {
        oneOf: [
          {
            type: 'object',
            title: 'Pessoa existente + família existente',
            properties: {
              pessoaId: { type: 'string', example: '123456' },
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
                    ehPrincipal: { type: 'boolean', example: true },
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
              novaFamilia: {
                allOf: [{ $ref: getSchemaPath(CriarFamiliaDto) }],
              },
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
                    ehPrincipal: { type: 'boolean', example: true },
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
                    ehPrincipal: { type: 'boolean', example: true },
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
              novaFamilia: {
                allOf: [{ $ref: getSchemaPath(CriarFamiliaDto) }],
              },
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
                    ehPrincipal: { type: 'boolean', example: true },
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
            estadoCivil: EstadoCivil.SOLTEIRO,
            vinculoEmpregaticio: VinculoEmpregaticio.DESEMPREGADO,
            quantidadeFilhos: 2,
            nivelEscolaridade: NivelEscolaridade.ENSINO_FUNDAMENTAL_COMPLETO,
            contatos: [
              {
                tipoContato: TipoContato.CELULAR,
                valor: '11999998888',
                ehPrincipal: true,
              },
            ],
          },
        },
        pessoa_existente_nova_familia: {
          summary: 'Pessoa existente + criar nova família',
          value: {
            pessoaId: '123456',
            estadoCivil: EstadoCivil.SOLTEIRO,
            vinculoEmpregaticio: VinculoEmpregaticio.DESEMPREGADO,
            quantidadeFilhos: 2,
            contatos: [
              {
                tipoContato: TipoContato.CELULAR,
                valor: '11999998888',
                ehPrincipal: true,
              },
            ],
            novaFamilia: {
              faixaRenda: FaixaRenda.ATE_1_SALARIO,
              possuiBeneficioSocial: true,
              tipoMoradia: TipoMoradia.ALUGADA,
              endereco: {
                logradouro: 'Rua A',
                numero: '123',
                complemento: 'Casa 1',
                bairro: 'Centro',
                cep: '12345678',
                cidade: 'Cidade',
                uf: 'SP',
              },
            },
            nivelEscolaridade: NivelEscolaridade.ENSINO_FUNDAMENTAL_COMPLETO,
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
            estadoCivil: EstadoCivil.SOLTEIRO,
            vinculoEmpregaticio: VinculoEmpregaticio.DESEMPREGADO,
            quantidadeFilhos: 2,
            contatos: [
              {
                tipoContato: TipoContato.CELULAR,
                valor: '11999998888',
                ehPrincipal: true,
              },
            ],
            nivelEscolaridade: NivelEscolaridade.ENSINO_MEDIO_COMPLETO,
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
            estadoCivil: EstadoCivil.SOLTEIRO,
            vinculoEmpregaticio: VinculoEmpregaticio.DESEMPREGADO,
            quantidadeFilhos: 2,
            contatos: [
              {
                tipoContato: TipoContato.CELULAR,
                valor: '11999998888',
                ehPrincipal: true,
              },
            ],
            novaFamilia: {
              faixaRenda: FaixaRenda.ATE_1_SALARIO,
              possuiBeneficioSocial: true,
              tipoMoradia: TipoMoradia.ALUGADA,
              endereco: {
                complemento: 'Casa 1',
                cep: '12345678',
                logradouro: 'Rua A',
                numero: '123',
                bairro: 'Centro',
                cidade: 'Cidade',
                uf: 'SP',
              },
            },
            nivelEscolaridade: NivelEscolaridade.ENSINO_MEDIO_COMPLETO,
          },
        },
      },
    }),
    ApiOperation({
      summary: 'Criar um novo beneficiário',
      description:
        'Cadastra um novo beneficiário vinculando uma pessoa (nova ou existente) e sua família.\n\n' +
        '**Regras por Idade e Emancipação:**\n' +
        '- **Menor de idade não emancipado (< 18 anos)**: Os campos `responsavelId` e `podeSairSozinho` são **obrigatórios** (a pessoa responsável informada deve possuir pelo menos 1 contato do tipo CELULAR cadastrado). A lista de `contatos` própria do menor é opcional.\n' +
        '- **Adulto (≥ 18 anos) ou Menor Emancipado (≥ 16 anos)**: A lista de `contatos` é **obrigatória** (mínimo 1 contato, com exatamente 1 contato marcado como `ehPrincipal: true`). Os campos `responsavelId` e `podeSairSozinho` não devem ser informados.',
    }),
    ApiCreatedResponse({
      description: 'O beneficiário foi criado com sucesso.',
      type: BeneficiarioDto,
    }),
    ApiConflictResponse({
      description:
        'Já existe uma pessoa com este CPF ou a pessoa informada já possui um benefício ativo.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao criar o beneficiário.',
    }),
  );
}

export function ApiDocVerificarCadastroPorCpf() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verificar cadastro de beneficiário pelo CPF',
    }),
    ApiParam({
      name: 'cpf',
      required: true,
      example: '12345678900',
      description: 'CPF com 11 dígitos numéricos.',
    }),
    ApiOkResponse({
      description:
        'Pessoa encontrada com sucesso e sem beneficiário vinculado.',
      type: PessoaDto,
    }),
    ApiBadRequestResponse({
      description: 'CPF inválido.',
    }),
    ApiNotFoundResponse({
      description: 'Pessoa não encontrada.',
    }),
    ApiConflictResponse({
      description: 'Pessoa já possui um cadastro de beneficiário ativo.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Erro interno ao verificar o cadastro de beneficiário.',
    }),
  );
}

export function ApiDocBuscarBeneficiarios() {
  return applyDecorators(
    ApiOperation({ summary: 'Buscar uma lista paginada de beneficiários' }),
    ApiPaginacaoResposta(BeneficiarioResumoDto),
    ApiQuery({
      name: 'pagina',
      required: false,
      example: 1,
      description: 'Número da página atual (padrão: 1)',
    }),
    ApiQuery({
      name: 'itensPorPagina',
      required: false,
      example: 10,
      description: 'Número de itens por página (padrão: 10)',
    }),
    ApiQuery({
      name: 'nome',
      required: false,
      example: 'João',
      description: 'Filtra beneficiários por parte do nome da pessoa',
    }),
    ApiQuery({
      name: 'cpf',
      required: false,
      example: '12345678900',
      description:
        'Filtra beneficiários por CPF da pessoa. Deve conter exatamente 11 dígitos numéricos, sem pontos ou traços.',
    }),
    ApiQuery({
      name: 'familiaId',
      required: false,
      example: '456',
      description: 'Filtra beneficiários pelo ID da família',
    }),
    ApiQuery({
      name: 'ignorarId',
      required: false,
      example: '123',
      description:
        'ID do beneficiário a ser ignorado/excluído do resultado da busca (ex: para listar familiares excluindo o próprio beneficiário da tela)',
    }),
    ApiBadRequestResponse({
      description:
        'Os parâmetros de paginação (página ou itensPorPagina) devem ser maiores ou iguais a 1.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar os beneficiários.',
    }),
  );
}

export function ApiDocBuscarBeneficiarioPorId() {
  return applyDecorators(
    ApiOperation({ summary: 'Buscar um beneficiário pelo ID' }),
    ApiOkResponse({
      description: 'O beneficiário foi encontrado com sucesso.',
      type: BeneficiarioDto,
    }),
    ApiNotFoundResponse({
      description: 'Beneficiário não encontrado.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao buscar o beneficiário.',
    }),
  );
}

export function ApiDocAtualizarBeneficiario() {
  return applyDecorators(
    ApiOperation({ summary: 'Atualizar os dados de um beneficiário' }),
    ApiOkResponse({
      description: 'O beneficiário foi atualizado com sucesso.',
      type: BeneficiarioDto,
    }),
    ApiNotFoundResponse({
      description: 'Beneficiário não encontrado.',
    }),
    ApiConflictResponse({
      description: 'Já existe uma pessoa cadastrada com este CPF.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao atualizar o beneficiário.',
    }),
  );
}

export function ApiDocTransferirFamilia() {
  return applyDecorators(
    ApiBody({
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
              faixaRenda: FaixaRenda.ATE_1_SALARIO,
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
    }),
    ApiOperation({
      summary:
        'Transfere o beneficiário para uma nova família (existente ou recém-criada)',
    }),
    ApiOkResponse({
      description: 'O beneficiário foi transferido com sucesso.',
      type: BeneficiarioDto,
    }),
    ApiNotFoundResponse({
      description: 'Beneficiário ou família destino não encontrados.',
    }),
    ApiBadRequestResponse({
      description:
        'O beneficiário já pertence a esta família ou os dados enviados são inválidos.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao transferir o beneficiário.',
    }),
  );
}

export function ApiDocRemoverBeneficiario() {
  return applyDecorators(
    ApiOperation({ summary: 'Deletar beneficiário pelo ID' }),
    ApiNoContentResponse({
      description: 'O beneficiário foi deletado com sucesso.',
    }),
    ApiNotFoundResponse({
      description: 'Beneficiário não encontrado.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Ocorreu um erro inesperado ao deletar o beneficiário.',
    }),
  );
}
