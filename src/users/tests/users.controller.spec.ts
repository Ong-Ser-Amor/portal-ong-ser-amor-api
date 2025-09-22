import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { mockCreateUserDto, mockUser } from '../mocks/user.mock';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updatePassword: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpa os mocks após cada teste
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    // Valida o fluxo de sucesso
    it('should create a user and return UserResponseDto', async () => {
      // Arrange
      mockUsersService.create.mockResolvedValue(mockUser);

      // Act
      const result = await controller.create(mockCreateUserDto);

      // Assert
      // Verifica se o resultado é uma instância de UserResponseDto
      expect(result).toBeInstanceOf(UserResponseDto);
      // Garante que o DTO de resposta filtrou os campos sensíveis
      expect(result).not.toHaveProperty('passwordHash');
      expect(mockUsersService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(new UserResponseDto(mockUser));
    });

    // Valida o fluxo de erro - Conflito (e-mail já cadastrado)
    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      mockUsersService.create.mockRejectedValue(new ConflictException());

      // Act & Assert
      await expect(controller.create(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersService.create).toHaveBeenCalledWith(mockCreateUserDto);
    });
  });

  describe('findOne', () => {
    // Valida o fluxo de sucesso
    it('should return UserResponseDto when user is found', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await controller.findOne(mockUser.id);

      // Assert
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result).not.toHaveProperty('passwordHash');
      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(new UserResponseDto(mockUser));
    });

    // Valida o fluxo de erro - Usuário não encontrado
    it('should throw NotFoundException when user is not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockUsersService.findOne.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('update', () => {
    // Valida o fluxo de sucesso
    it('should update a user and return UserResponseDto', async () => {
      // Arrange
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update(mockUser.id, {
        name: 'Updated Name',
      });

      // Assert
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result).not.toHaveProperty('passwordHash');
      expect(mockUsersService.update).toHaveBeenCalledWith(mockUser.id, {
        name: 'Updated Name',
      });
      expect(result).toEqual(new UserResponseDto(updatedUser));
    });

    // valida o fluxo de erro - Conflito (e-mail já cadastrado)
    it('should throw ConflictException when email is already in use by another user', async () => {
      // Arrange
      mockUsersService.update.mockRejectedValue(new ConflictException());

      // Act & Assert
      await expect(
        controller.update(mockUser.id, { email: 'existing@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    // Valida o fluxo de erro - Usuário não encontrado
    it('should throw NotFoundException when trying to update a non-existent user', async () => {
      // Arrange
      const nonExistentId = 99;
      mockUsersService.update.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(
        controller.update(nonExistentId, { name: 'Name' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockUsersService.update).toHaveBeenCalledWith(nonExistentId, {
        name: 'Name',
      });
    });
  });

  describe('updatePassword', () => {
    const updatePasswordDto: UpdatePasswordDto = {
      currentPassword: 'oldPassword',
      newPassword: 'newStrongPassword',
    };

    // Valida o fluxo de sucesso
    it('should update the user password', async () => {
      // Arrange
      mockUsersService.updatePassword.mockResolvedValue(undefined);

      // Act
      const result = await controller.updatePassword(
        updatePasswordDto,
        mockUser.id,
      );

      // Assert
      expect(result).toBeUndefined();
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        mockUser.id,
        updatePasswordDto,
      );
    });

    // Valida o fluxo de erro - Usuário não encontrado
    it('should throw NotFoundException when user is not found', async () => {
      // Arrange
      mockUsersService.updatePassword.mockRejectedValue(
        new NotFoundException(),
      );

      // Act & Assert
      await expect(
        controller.updatePassword(updatePasswordDto, mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    // Valida o fluxo de sucesso
    it('should remove the user', async () => {
      // Arrange
      mockUsersService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(mockUser.id);

      // Assert
      expect(result).toBeUndefined();
      expect(mockUsersService.remove).toHaveBeenCalledWith(mockUser.id);
    });

    // Valida o fluxo de erro - Usuário não encontrado
    it('should throw NotFoundException when trying to remove a non-existent user', async () => {
      // Arrange
      const nonExistentId = 99;
      mockUsersService.remove.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.remove).toHaveBeenCalledWith(nonExistentId);
    });
  });
});
