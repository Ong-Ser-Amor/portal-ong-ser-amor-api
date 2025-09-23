import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockUser } from 'src/users/mocks/user.mock';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { SignInResponseDto } from '../dto/sign-in-response.dto';
import { mockSignInDto } from '../mocks/sign-in.mock';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return SignInResponseDto on successful sign-in', async () => {
      // Arrange
      const signInResultFromService = {
        access_token: 'fake-token',
        user: mockUser,
      };
      mockAuthService.signIn.mockResolvedValue(signInResultFromService);

      // Act
      const result = await controller.signIn(mockSignInDto);

      // Assert
      expect(mockAuthService.signIn).toHaveBeenCalledWith(mockSignInDto);
      expect(result).toBeInstanceOf(SignInResponseDto);
      expect(result.access_token).toEqual(signInResultFromService.access_token);
      expect(result.user.id).toEqual(mockUser.id);
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).toEqual(
        expect.objectContaining({ email: mockUser.email }),
      );
    });

    // Valida o fluxo de erro genérico
    it('should re-throw UnauthorizedException from service', async () => {
      // Arrange
      mockAuthService.signIn.mockRejectedValue(new UnauthorizedException());

      // Act & Assert
      await expect(controller.signIn(mockSignInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
