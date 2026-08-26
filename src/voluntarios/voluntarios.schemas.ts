import { ApiBodyOptions } from '@nestjs/swagger';

import { StatusFormacao, TipoVoluntario } from './enums/voluntario.enum';

const PROPS_VOLUNTARIO = {
  tipoVoluntario: {
    type: 'string',
    enum: Object.values(TipoVoluntario),
  },
  formacaoAcademica: { type: 'string', example: 'Pedagogia' },
  statusFormacao: {
    type: 'string',
    enum: Object.values(StatusFormacao),
  },
};

const PROPS_NOVA_PESSOA = {
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
};

export const API_BODY_CRIAR_VOLUNTARIO: ApiBodyOptions = {
  description:
    'Existem 2 cenários:\n' +
    "1) Se o voluntário JÁ É cadastrado como pessoa: envie 'pessoaId' (não envie 'nome', 'cpf' ou 'dataNascimento') + os campos do voluntário.\n" +
    "2) Se o voluntário NÃO possui cadastro de pessoa: envie 'nome', 'cpf' e 'dataNascimento' + os campos do voluntário (não envie 'pessoaId').",
  schema: {
    oneOf: [
      {
        type: 'object',
        title: 'Pessoa existente',
        properties: {
          pessoaId: { type: 'string', example: '123456' },
          ...PROPS_VOLUNTARIO,
        },
        required: ['pessoaId', 'tipoVoluntario'],
      },
      {
        type: 'object',
        title: 'Nova pessoa',
        properties: {
          ...PROPS_NOVA_PESSOA,
          ...PROPS_VOLUNTARIO,
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
        tipoVoluntario: TipoVoluntario.COORDENADOR_CURSOS,
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
};
