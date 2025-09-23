import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { mockUser } from 'src/users/mocks/user.mock';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from 'src/utils/password';

import { AuthService } from '../auth.service';
import { SignInDto } from '../dto/sign-in.dto';

// Mock da função externa que não está injetada
jest.mock('src/utils/password');

describe('AuthService', () => {
  let service: AuthService;

  // Mock silencioso do logger para evitar logs durante os testes
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockUsersService = {
    findOneByEmailWithPassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    })
      .setLogger(mockLogger)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const mockSignInDto: SignInDto = {
      email: mockUser.email,
      password: 'password',
    };

    // Valida o fluxo de sucesso
    it('should return an access token and user on successful sign-in', async () => {
      // Arrange
      mockUsersService.findOneByEmailWithPassword.mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      const fakeToken = 'fake-jwt-token';
      mockJwtService.sign.mockReturnValue(fakeToken);

      // Act
      const result = await service.signIn(mockSignInDto);

      // Assert
      expect(mockUsersService.findOneByEmailWithPassword).toHaveBeenCalledWith(
        mockSignInDto.email,
      );
      expect(comparePassword).toHaveBeenCalledWith(
        mockSignInDto.password,
        mockUser.passwordHash,
      );
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toEqual({
        access_token: fakeToken,
        user: mockUser,
      });
    });

    // Valida o fluxo de erro quando o usuário não é encontrado
    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      mockUsersService.findOneByEmailWithPassword.mockResolvedValue(null);

      // Act & Assert
      await expect(service.signIn(mockSignInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // Valida o fluxo de erro quando a senha está incorreta
    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Arrange
      mockUsersService.findOneByEmailWithPassword.mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.signIn(mockSignInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // Valida o fluxo de erro genérico
    it('should throw InternalServerErrorException on error during sign-in process', async () => {
      // Arrange
      mockUsersService.findOneByEmailWithPassword.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.signIn(mockSignInDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
