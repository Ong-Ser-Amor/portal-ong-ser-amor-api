export const ERROS_ATUALIZACAO_TURMA = {
  ALUNOS_ATIVOS_AO_FINALIZAR: {
    codigo: 'TURMA_ALUNOS_ATIVOS_AO_FINALIZAR',
    mensagem:
      'Não é possível finalizar a turma pois ainda existem alunos com a matrícula no status ATIVA. Altere o status de todas as matrículas para CONCLUIDA ou EVADIDA antes de finalizar a turma.',
  },
  CONFLITO_DATA_INICIO: {
    codigo: 'TURMA_CONFLITO_DATA_INICIO',
    mensagem:
      'Não é possível postergar a data de início da turma, pois já existem aulas cadastradas em datas anteriores a esse novo limite.',
  },
  CONFLITO_DATA_FIM: {
    codigo: 'TURMA_CONFLITO_DATA_FIM',
    mensagem:
      'Não é possível adiantar a data final da turma, pois já existem aulas cadastradas em datas posteriores a esse novo limite.',
  },
  DATAS_INVERTIDAS: {
    codigo: 'TURMA_DATAS_INVERTIDAS',
    mensagem: 'A data final não pode ser anterior à data de início da turma.',
  },
  CRITERIO_SEM_CONTROLE_INVALIDO: {
    codigo: 'TURMA_CRITERIO_SEM_CONTROLE_INVALIDO',
    mensagem:
      'Turmas sem controle de avaliação não podem possuir limites de nota ou frequência mínima.',
  },
  CRITERIO_PARTICIPACAO_SEM_FREQUENCIA: {
    codigo: 'TURMA_CRITERIO_PARTICIPACAO_SEM_FREQUENCIA',
    mensagem:
      'O campo frequência mínima é obrigatório para turmas avaliadas por participação.',
  },
  CRITERIO_PARTICIPACAO_COM_NOTA: {
    codigo: 'TURMA_CRITERIO_PARTICIPACAO_COM_NOTA',
    mensagem:
      'Turmas avaliadas por participação não devem possuir uma nota mínima de aprovação.',
  },
  CRITERIO_NOTA_PRESENCA_INCOMPLETO: {
    codigo: 'TURMA_CRITERIO_NOTA_PRESENCA_INCOMPLETO',
    mensagem:
      'Os campos de frequência mínima e nota mínima são obrigatórios para turmas com aprovação por nota e presença.',
  },
  CRITERIO_QUALITATIVA_COM_NOTA: {
    codigo: 'TURMA_CRITERIO_QUALITATIVA_COM_NOTA',
    mensagem:
      'Turmas com avaliação qualitativa não devem possuir uma nota mínima numérica de aprovação.',
  },
} as const;
