export function calcularIdade(dataNascimento: Date | string): number {
  const dataNormalizada = normalizarDataNascimento(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNormalizada.getFullYear();
  const mes = hoje.getMonth() - dataNormalizada.getMonth();

  // Verifica se o mês atual é anterior ao mês de nascimento ou se é o mesmo mês, mas o dia atual é anterior ao dia de nascimento
  if (mes < 0 || (mes === 0 && hoje.getDate() < dataNormalizada.getDate())) {
    idade--;
  }

  return idade;
}

function normalizarDataNascimento(dataNascimento: Date | string): Date {
  if (dataNascimento instanceof Date) {
    return dataNascimento;
  }

  const partes = dataNascimento.split('-').map(Number);

  if (partes.length === 3 && partes.every((parte) => Number.isInteger(parte))) {
    const [ano, mes, dia] = partes;
    return new Date(ano, mes - 1, dia);
  }

  const data = new Date(dataNascimento);

  if (Number.isNaN(data.getTime())) {
    throw new Error('Data de nascimento inválida.');
  }

  return data;
}
