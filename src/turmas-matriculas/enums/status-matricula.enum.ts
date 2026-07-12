/**
 * Enum que controla a situação do vínculo do aluno com a turma durante o período letivo.
 */
export enum StatusMatricula {
  ATIVA = 'ATIVA', // Aluno frequentando as aulas normalmente
  CONCLUIDA = 'CONCLUIDA', // Aluno chegou ao final do curso/oficina
  EVADIDA = 'EVADIDA', // Aluno abandonou o curso ou desistiu da vaga
}
