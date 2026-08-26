import { ApiBodyOptions, getSchemaPath } from '@nestjs/swagger';
import { TipoContato } from 'src/contatos/enums/tipo-contato.enum';
import { CriarFamiliaDto } from 'src/familias/dto/criar-familia.dto';
import { FaixaRenda } from 'src/familias/enums/faixa-renda.enum';
import { TipoMoradia } from 'src/familias/enums/tipo-moradia.enum';

import {
  EstadoCivil,
  NivelEscolaridade,
  VinculoEmpregaticio,
} from './enums/beneficiario.enum';

// --- Propriedades de Schemas Reutilizáveis ---

const PROPS_BENEFICIARIO = {
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
};

const PROPS_NOVA_PESSOA = {
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
};

// --- Exemplos Reutilizáveis ---

const EXEMPLO_CONTATOS = [
  {
    tipoContato: TipoContato.CELULAR,
    valor: '11999998888',
    ehPrincipal: true,
  },
  {
    tipoContato: TipoContato.TELEFONE_FIXO,
    valor: '1141410000',
  },
  {
    tipoContato: TipoContato.EMAIL,
    valor: 'joao.silva@email.com',
  },
];

const EXEMPLO_NOVA_FAMILIA = {
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
};

const EXEMPLO_PESSOA = {
  nome: 'João da Silva',
  cpf: '12345678900',
  dataNascimento: '1990-01-01',
  emancipado: false,
  podeSairSozinho: true,
  responsavelId: '10',
};

const EXEMPLO_BENEFICIARIO_BASE = {
  estadoCivil: EstadoCivil.SOLTEIRO,
  vinculoEmpregaticio: VinculoEmpregaticio.DESEMPREGADO,
  quantidadeFilhos: 2,
  contatos: EXEMPLO_CONTATOS,
};

// --- Schemas Exportados ---

export const API_BODY_CRIAR_BENEFICIARIO: ApiBodyOptions = {
  description:
    'Existem 2 cenários mutuamente exclusivos:\n' +
    "1) Se a pessoa JÁ É cadastrada: envie 'pessoaId' + os campos do beneficiário. NENHUM dado de pessoa ('nome', 'cpf', 'dataNascimento', 'emancipado', 'podeSairSozinho', 'responsavelId') deve ser informado.\n" +
    "2) Se a pessoa NÃO possui cadastro de pessoa: envie os dados cadastrais da pessoa ('nome', 'cpf', 'dataNascimento', etc.) + os campos do beneficiário (não envie 'pessoaId'). Em ambos os casos você pode informar 'familiaId' ou os dados de 'novaFamilia'.",
  schema: {
    oneOf: [
      {
        type: 'object',
        title: 'Pessoa existente + família existente',
        properties: {
          pessoaId: { type: 'string', example: '123456' },
          familiaId: { type: 'string', example: '789012' },
          ...PROPS_BENEFICIARIO,
        },
        required: ['pessoaId', 'familiaId', 'nivelEscolaridade'],
      },
      {
        type: 'object',
        title: 'Pessoa existente + criar nova família',
        properties: {
          pessoaId: { type: 'string', example: '123456' },
          novaFamilia: { allOf: [{ $ref: getSchemaPath(CriarFamiliaDto) }] },
          ...PROPS_BENEFICIARIO,
        },
        required: ['pessoaId', 'novaFamilia', 'nivelEscolaridade'],
      },
      {
        type: 'object',
        title: 'Nova pessoa + família existente',
        properties: {
          familiaId: { type: 'string', example: '789012' },
          ...PROPS_NOVA_PESSOA,
          ...PROPS_BENEFICIARIO,
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
          novaFamilia: { allOf: [{ $ref: getSchemaPath(CriarFamiliaDto) }] },
          ...PROPS_NOVA_PESSOA,
          ...PROPS_BENEFICIARIO,
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
        nivelEscolaridade: NivelEscolaridade.ENSINO_FUNDAMENTAL_COMPLETO,
        ...EXEMPLO_BENEFICIARIO_BASE,
      },
    },
    pessoa_existente_nova_familia: {
      summary: 'Pessoa existente + criar nova família',
      value: {
        pessoaId: '123456',
        novaFamilia: EXEMPLO_NOVA_FAMILIA,
        nivelEscolaridade: NivelEscolaridade.ENSINO_FUNDAMENTAL_COMPLETO,
        ...EXEMPLO_BENEFICIARIO_BASE,
      },
    },
    pessoa_nova_familia_existente: {
      summary: 'Nova pessoa + família existente',
      value: {
        familiaId: '789012',
        nivelEscolaridade: NivelEscolaridade.ENSINO_MEDIO_COMPLETO,
        ...EXEMPLO_PESSOA,
        ...EXEMPLO_BENEFICIARIO_BASE,
      },
    },
    pessoa_nova_nova_familia: {
      summary: 'Nova pessoa + criar nova família',
      value: {
        novaFamilia: EXEMPLO_NOVA_FAMILIA,
        nivelEscolaridade: NivelEscolaridade.ENSINO_MEDIO_COMPLETO,
        ...EXEMPLO_PESSOA,
        ...EXEMPLO_BENEFICIARIO_BASE,
      },
    },
  },
};

export const API_BODY_TRANSFERIR_FAMILIA: ApiBodyOptions = {
  description:
    "Envie o 'familiaId' de destino OU os dados de 'novaFamilia' para criar a família de destino.",
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
          novaFamilia: { $ref: getSchemaPath(CriarFamiliaDto) },
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
        novaFamilia: EXEMPLO_NOVA_FAMILIA,
      },
    },
  },
};
