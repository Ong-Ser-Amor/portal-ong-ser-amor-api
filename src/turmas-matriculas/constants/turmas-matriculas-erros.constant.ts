export const ERROS_ATUALIZACAO_MATRICULA = {
  TURMA_NAO_EM_ANDAMENTO: {
    codigo: 'MATRICULA_TURMA_NAO_EM_ANDAMENTO',
    mensagem:
      'Não é permitido modificar notas, pareceres ou dados cadastrais de matrículas quando a turma está com o status diferente de EM_ANDAMENTO.',
  },
  MATRICULA_NAO_CONCLUIDA_COM_RESULTADO: {
    codigo: 'MATRICULA_NAO_CONCLUIDA_COM_RESULTADO',
    mensagem:
      'Matrículas com status diferente de CONCLUIDA não podem possuir resultado final. O resultado final só deve ser atribuído quando a matrícula for concluída.',
  },
  MATRICULA_NAO_CONCLUIDA_COM_NOTA: {
    codigo: 'MATRICULA_NAO_CONCLUIDA_COM_NOTA',
    mensagem:
      'Matrículas com status diferente de CONCLUIDA não podem possuir nota final. A nota final só deve ser informada quando a matrícula for concluída.',
  },
  ATIVIDADE_AVALIATIVA_PENDENTE: {
    codigo: 'MATRICULA_ATIVIDADE_AVALIATIVA_PENDENTE',
    mensagem:
      'Não é possível concluir a matrícula pois existem atividades avaliativas pendentes de entrega ou sem nota atribuída para este aluno.',
  },
  TURMA_POSSUI_AULAS_AGENDADAS: {
    codigo: 'MATRICULA_TURMA_POSSUI_AULAS_AGENDADAS',
    mensagem:
      'Não é possível concluir a matrícula pois a turma ainda possui aulas agendadas pendentes de realização ou cancelamento.',
  },
  RESULTADO_FINAL_OBRIGATORIO: {
    codigo: 'MATRICULA_RESULTADO_FINAL_OBRIGATORIO',
    mensagem:
      'É obrigatório definir o resultado final (APROVADO/REPROVADO) para turmas com avaliação por nota.',
  },
  NOTA_FINAL_OBRIGATORIA: {
    codigo: 'MATRICULA_NOTA_FINAL_OBRIGATORIA',
    mensagem:
      'A turma foi configurada para avaliação por nota, portanto é obrigatório informar a nota final do aluno.',
  },
  QUALITATIVA_RESULTADO_OBRIGATORIO: {
    codigo: 'MATRICULA_QUALITATIVA_RESULTADO_OBRIGATORIO',
    mensagem:
      'É obrigatório definir o resultado final (APROVADO/REPROVADO) para turmas com avaliação qualitativa.',
  },
  PARTICIPACAO_RESULTADO_OBRIGATORIO: {
    codigo: 'MATRICULA_PARTICIPACAO_RESULTADO_OBRIGATORIO',
    mensagem:
      'É obrigatório definir o resultado final (APROVADO/REPROVADO) para turmas com avaliação por participação.',
  },
  SEM_CONTROLE_RESULTADO_INVALIDO: {
    codigo: 'MATRICULA_SEM_CONTROLE_RESULTADO_INVALIDO',
    mensagem:
      'Turmas sem controle de avaliação não aceitam o preenchimento de resultado final.',
  },
  SEM_CONTROLE_NOTA_INVALIDA: {
    codigo: 'MATRICULA_SEM_CONTROLE_NOTA_INVALIDA',
    mensagem:
      'Não é permitido atribuir pontuação/nota para turmas sem controle de avaliação.',
  },
  QUALITATIVA_NOTA_INVALIDA: {
    codigo: 'MATRICULA_QUALITATIVA_NOTA_INVALIDA',
    mensagem:
      'Turmas com avaliação qualitativa não aceitam o preenchimento de nota final.',
  },
  PARTICIPACAO_NOTA_INVALIDA: {
    codigo: 'MATRICULA_PARTICIPACAO_NOTA_INVALIDA',
    mensagem:
      'Turmas com avaliação por participação não aceitam o preenchimento de nota final.',
  },
} as const;
