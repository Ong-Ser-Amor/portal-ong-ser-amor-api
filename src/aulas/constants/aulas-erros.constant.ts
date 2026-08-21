export const ERROS_ATUALIZACAO_AULA = {
  AULA_COM_CHAMADA_NAO_PODE_AGENDAR: {
    codigo: 'AULA_COM_CHAMADA_NAO_PODE_AGENDAR',
    mensagem:
      'Esta aula já possui registros de presença lançados e não pode retornar ao status de AGENDADA. Para reverter o status, exclua a lista de chamadas da aula primeiro.',
  },
  AULA_COM_CHAMADA_NAO_PODE_CANCELAR: {
    codigo: 'AULA_COM_CHAMADA_NAO_PODE_CANCELAR',
    mensagem:
      'Não é possível CANCELAR uma aula que já possui registros de chamada salvos no sistema. Exclua a lista de chamadas da aula antes de cancelá-la.',
  },
  AULA_REALIZADA_SEM_CHAMADA: {
    codigo: 'AULA_REALIZADA_SEM_CHAMADA',
    mensagem:
      'Não é possível marcar uma aula como REALIZADA sem antes registrar o lote de chamadas dos alunos.',
  },
  AULA_DATA_ANTERIOR_INICIO_TURMA: {
    codigo: 'AULA_DATA_ANTERIOR_INICIO_TURMA',
    mensagem: 'A data da aula não pode ser anterior à data de início da turma.',
  },
  AULA_DATA_POSTERIOR_FIM_TURMA: {
    codigo: 'AULA_DATA_POSTERIOR_FIM_TURMA',
    mensagem:
      'A data da aula não pode ser posterior à data de encerramento da turma.',
  },
  AULA_DATA_DUPLICADA: {
    codigo: 'AULA_DATA_DUPLICADA',
    mensagem: 'Já existe uma aula cadastrada nesta mesma data para esta turma.',
  },
} as const;
