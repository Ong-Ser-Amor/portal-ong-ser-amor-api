import { compare, hash } from 'bcrypt';

export const criarSenhaHash = async (senha: string): Promise<string> => {
  return await hash(senha, 10);
};

export const compararSenha = async (
  senha: string,
  hashDaSenha: string,
): Promise<boolean> => {
  return await compare(senha, hashDaSenha);
};
