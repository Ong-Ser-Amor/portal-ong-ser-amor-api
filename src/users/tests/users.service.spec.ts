import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { comparePassword, createPasswordHash } from 'src/utils/password';
import { EntityNotFoundError, Repository, SelectQueryBuilder } from 'typeorm';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { mockCreateUserDto, mockUser } from '../mocks/user.mock';
import { UsersService } from '../users.service';

jest.mock('./../../utils/password', () => ({
  createPasswordHash: jest.fn(),
  comparePassword: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  // Mock silencioso do logger para evitar logs durante os testes
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  // Mock do repositório para simular o banco de dados
  const userRepositoryMock = {
    create: jest.fn().mockImplementation((dto: CreateUserDto) => dto),
    comparePassword: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    findOneByOrFail: jest.fn(),
    merge: jest
      .fn()
      .mockImplementation((user: User, dto: UpdateUserDto) =>
        Object.assign(user, dto),
      ),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  // Mock completo do QueryBuilder
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  } as jest.Mocked<Partial<SelectQueryBuilder<User>>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    })
      .setLogger(mockLogger)
      .compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Limpa o estado dos mocks entre os testes para evitar interferência
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    // Valida o fluxo de sucesso
    it('should create a user, save it with hashed password, and return the user', async () => {
      // Arrange
      userRepositoryMock.save.mockImplementation(() =>
        Promise.resolve(mockUser),
      );
      (createPasswordHash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act
      const result = await service.create(mockCreateUserDto);

      // Assert
      expect(userRepositoryMock.save).toHaveBeenCalledTimes(1);
      // Garante que a propriedade passwordHash foi passada com a senha hasheada
      expect(userRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockCreateUserDto.name,
          email: mockCreateUserDto.email,
          passwordHash: 'hashedPassword',
        }),
      );
      // Garante que a senha original não foi passada para o save
      expect(userRepositoryMock.save).not.toHaveBeenCalledWith(
        expect.objectContaining({
          password: mockCreateUserDto.password,
        }),
      );
      expect(result).toEqual(mockUser);
    });

    // Valida a chamada ao helper de senha
    it('should hash the password before saving', async () => {
      // Arrange
      userRepositoryMock.save.mockResolvedValue(mockUser);

      // Act
      await service.create(mockCreateUserDto);

      // Assert
      expect(createPasswordHash).toHaveBeenCalledWith(
        mockCreateUserDto.password,
      );
    });

    // Valida o tratamento de erro quando o usuário já existe
    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      jest.spyOn(service, 'findOneByEmail').mockResolvedValueOnce(mockUser);

      // Act & Assert
      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepositoryMock.save).not.toHaveBeenCalled();
    });

    // Valida o tratamento de erro genérico
    it('should throw error if repository.save fails', async () => {
      // Arrange
      const errorMessage = 'Database error';
      userRepositoryMock.save.mockRejectedValueOnce(new Error(errorMessage));

      // Act & Assert
      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    // Valida o fluxo de sucesso
    it('should return a user by id', async () => {
      // Arrange
      userRepositoryMock.findOneByOrFail.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOne(mockUser.id);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepositoryMock.findOneByOrFail).toHaveBeenCalledWith({
        id: mockUser.id,
      });
    });

    // Valida o tratamento de erro quando o usuário não é encontrado
    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      userRepositoryMock.findOneByOrFail.mockRejectedValueOnce(
        new EntityNotFoundError(User, { id: 99 }),
      );

      // Act & Assert
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    // Valida o tratamento de erro genérico
    it('should throw InternalServerErrorException if repository.findOne fails', async () => {
      // Arrange
      userRepositoryMock.findOneByOrFail.mockRejectedValueOnce(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findOne(99)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOneByEmail', () => {
    // Valida o fluxo de sucesso
    it('should return a user when the email exists', async () => {
      // Arrange
      userRepositoryMock.findOneBy.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOneByEmail(mockUser.email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepositoryMock.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });

    // Valida o retorno undefined quando o usuário não é encontrado
    it('should return undefined when the email does not exist', async () => {
      // Arrange
      userRepositoryMock.findOneBy.mockResolvedValue(undefined);

      // Act
      const result = await service.findOneByEmail('non.existent@email.com');

      // Assert
      expect(result).toBeUndefined();
      expect(userRepositoryMock.findOneBy).toHaveBeenCalledWith({
        email: 'non.existent@email.com',
      });
    });

    // Valida o tratamento de erro genérico
    it('should throw InternalServerErrorException if repository.findOne fails', async () => {
      // Arrange
      userRepositoryMock.findOneBy.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findOneByEmail('any@email.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOneByEmailOrFail', () => {
    let findOneByEmailSpy: jest.SpyInstance;

    beforeEach(() => {
      // Espionamos o método base que será reutilizado
      findOneByEmailSpy = jest.spyOn(service, 'findOneByEmail');
    });

    // Valida o fluxo de sucesso
    it('should return a user when the email exists', async () => {
      // Arrange
      findOneByEmailSpy.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOneByEmailOrFail(mockUser.email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(findOneByEmailSpy).toHaveBeenCalledWith(mockUser.email);
    });

    // Valida o tratamento de erro quando o usuário não é encontrado
    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      findOneByEmailSpy.mockResolvedValue(undefined);

      // Act & Assert
      await expect(
        service.findOneByEmailOrFail('non.existent@email.com'),
      ).rejects.toThrow(NotFoundException);
    });

    // Valida o tratamento de erro genérico
    it('should throw InternalServerErrorException if repository.findOne fails', async () => {
      // Arrange
      userRepositoryMock.findOneByOrFail.mockRejectedValueOnce(
        new Error('Database error'), // Mantemos o erro genérico aqui
      );

      // Act & Assert
      await expect(service.findOneByEmail('any@email.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOneByEmailWithPassword', () => {
    beforeEach(() => {
      userRepositoryMock.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as unknown as SelectQueryBuilder<User>,
      );
    });

    // Valida o fluxo de sucesso
    it('should return a user with the password hash when the email exists', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOneByEmailWithPassword(mockUser.email);

      // Assert
      expect(userRepositoryMock.createQueryBuilder).toHaveBeenCalledWith(
        'user',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.email = :email',
        { email: mockUser.email },
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'user.passwordHash',
      );
      expect(result).toEqual(mockUser);
      expect(result.passwordHash).toBeDefined(); // Garante que o hash veio junto
    });

    // Valida o retorno undefined quando o usuário não é encontrado
    it('should return undefined when the email does not exist', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockResolvedValue(undefined);

      // Act
      const result = await service.findOneByEmailWithPassword(
        'non.existent@email.com',
      );

      // Assert
      expect(result).toBeUndefined();
    });

    // Valida o tratamento de erro genérico
    it('should throw InternalServerErrorException if the query fails', async () => {
      // Arrange
      mockQueryBuilder.getOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.findOneByEmailWithPassword('any@email.com'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    let findOneSpy: jest.SpyInstance;
    let findOneByEmailSpy: jest.SpyInstance;

    beforeEach(() => {
      // Adicionamos o spy que estava faltando
      findOneSpy = jest.spyOn(service, 'findOne');
      findOneByEmailSpy = jest.spyOn(service, 'findOneByEmail');
    });

    // Valida o fluxo de sucesso (sem alterar e-mail)
    it('should update user name and return the updated user', async () => {
      // Arrange
      const updateUserDto = { name: 'Updated Name' };

      findOneSpy.mockResolvedValue(mockUser);

      userRepositoryMock.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      // Act
      const result = await service.update(mockUser.id, updateUserDto);

      // Assert
      expect(result.name).toEqual('Updated Name');
      expect(userRepositoryMock.save).toHaveBeenCalledWith(mockUser);
    });

    // Valida o tratamento de erro quando o usuário não é encontrado
    it('should throw NotFoundException if user to update not found', async () => {
      // Arrange
      findOneSpy.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.update(99, { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });

    // Valida o tratamento de erro genérico
    it('should throw InternalServerErrorException if update fails', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockUser);
      userRepositoryMock.save.mockRejectedValueOnce(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        service.update(mockUser.id, { name: 'New Name' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updatePassword', () => {
    let findOneByIdWithPasswordSpy: jest.SpyInstance;
    const updatePasswordDto: UpdatePasswordDto = {
      currentPassword: 'currentPassword123',
      newPassword: 'newPassword456',
    };

    beforeEach(() => {
      findOneByIdWithPasswordSpy = jest.spyOn(
        service,
        'findOneByIdWithPassword',
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    // Valida o fluxo de sucesso
    it('should call save with the new hashed password when current password is correct', async () => {
      // Arrange
      findOneByIdWithPasswordSpy.mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (createPasswordHash as jest.Mock).mockResolvedValue('newHashedPassword');
      userRepositoryMock.save.mockResolvedValue(undefined);

      // Act
      await service.updatePassword(mockUser.id, updatePasswordDto);

      // Assert
      expect(comparePassword).toHaveBeenCalledWith(
        updatePasswordDto.currentPassword,
        'hashedPassword',
      );
      expect(createPasswordHash).toHaveBeenCalledWith(
        updatePasswordDto.newPassword,
      );
      expect(userRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'newHashedPassword' }),
      );
    });

    // Valida o erro de usuário não encontrado
    it('should throw NotFoundException if user to update not found', async () => {
      // Arrange
      findOneByIdWithPasswordSpy.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updatePassword(99, updatePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    // Valida o erro de senha atual incorreta
    it('should throw BadRequestException if the current password is incorrect', async () => {
      // Arrange
      findOneByIdWithPasswordSpy.mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.updatePassword(mockUser.id, updatePasswordDto),
      ).rejects.toThrow(BadRequestException);

      // Garante que, se a senha estiver errada, nada mais é executado
      expect(createPasswordHash).not.toHaveBeenCalled();
      expect(userRepositoryMock.save).not.toHaveBeenCalled();
    });

    // Valida o tratamento de erro genérico
    it('should throw InternalServerErrorException if update fails', async () => {
      // Arrange
      findOneByIdWithPasswordSpy.mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (createPasswordHash as jest.Mock).mockResolvedValue('newHashedPassword');
      userRepositoryMock.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.updatePassword(mockUser.id, updatePasswordDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      // Espionamos o 'findOne' pois ele é chamado internamente
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    afterEach(() => {
      // Restaura o espião após cada teste.
      jest.restoreAllMocks();
    });

    // Valida o fluxo de sucesso
    it('should soft delete the user', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockUser);
      userRepositoryMock.softDelete.mockResolvedValue({ affected: 1 });

      // Act
      await service.remove(mockUser.id);

      // Assert
      expect(findOneSpy).toHaveBeenCalledWith(mockUser.id);
      expect(userRepositoryMock.softDelete).toHaveBeenCalledWith(mockUser.id);
    });

    // Valida o erro de usuário não encontrado
    it('should throw NotFoundException if user to delete not found', async () => {
      // Arrange
      findOneSpy.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(userRepositoryMock.softDelete).not.toHaveBeenCalled();
    });

    // Valida o tratamento de erro genérico
    it('should throw InternalServerErrorException if delete fails', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockUser);
      userRepositoryMock.softDelete.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.remove(mockUser.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
