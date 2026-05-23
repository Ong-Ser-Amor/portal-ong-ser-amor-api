export function calcularIdade(dataNascimento: Date): number {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const mes = hoje.getMonth() - dataNascimento.getMonth();

  // Verifica se o mês atual é anterior ao mês de nascimento ou se é o mesmo mês, mas o dia atual é anterior ao dia de nascimento
  if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
    idade--;
  }

  return idade;
}
