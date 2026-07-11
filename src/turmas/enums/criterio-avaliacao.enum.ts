/**
 * Enum que define o modelo de avaliação e pontuação adotado por uma turma.
 * Ele dita quais regras de corte (nota/presença) o sistema deve aplicar.
 */
export enum CriterioAvaliacao {
  SEM_CONTROLE = 'SEM_CONTROLE', // Oficinas livres, sem controle rigido de presença ou nota
  POR_PARTICIPACAO = 'POR_PARTICIPACAO', // Oficinas com aprovação por presença
  POR_NOTA_PRESENCA = 'POR_NOTA_PRESENCA', // Cursos com aprovação por nota e presença
  QUALITATIVA = 'QUALITATIVA', // Cursos focados em parecer ou conceito pedagógico
}
