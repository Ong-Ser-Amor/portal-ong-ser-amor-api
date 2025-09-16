import { compare, hash } from 'bcrypt';

export const createPasswordHash = async (password: string): Promise<string> => {
  return await hash(password, 10);
};

export const comparePassword = async (
  password: string,
  passwordHashed: string,
): Promise<boolean> => {
  return await compare(password, passwordHashed);
};
