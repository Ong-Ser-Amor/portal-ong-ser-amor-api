import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

// Um DTO de exemplo para ser usado como entrada nos testes de criação
export const mockCreateUserDto: CreateUserDto = {
  name: 'Mock User',
  email: 'mock@example.com',
  password: 'password123',
};

// Uma entidade User de exemplo, representando o que seria retornado do banco
export const mockUser: User = {
  id: 1,
  name: 'Mock User',
  email: 'mock@example.com',
  passwordHash: 'hashedPassword',
  createdAt: new Date('2025-09-17T15:00:00.000Z'),
  updatedAt: new Date('2025-09-17T15:00:00.000Z'),
  deletedAt: null,
};

// Uma lista de usuários para testar métodos como `findAll`
export const mockUserList: User[] = [
  mockUser,
  { ...mockUser, id: 2, email: 'mock2@example.com' },
];
