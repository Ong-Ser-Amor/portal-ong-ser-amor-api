import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from 'src/utils/password';

import { SignInPayloadDto } from './dto/sign-in-payload.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    try {
      const user = await this.userService.findOneByEmailWithPassword(
        signInDto.email,
      );

      if (!user) {
        throw new UnauthorizedException('Email or password invalid!');
      }

      const isPasswordMatch = await comparePassword(
        signInDto.password,
        user.passwordHash,
      );

      if (!isPasswordMatch) {
        throw new UnauthorizedException('Email or password invalid!');
      }

      const payload = new SignInPayloadDto(user);
      const accessToken = this.jwtService.sign({ ...payload });

      return {
        access_token: accessToken,
        user: user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Error during sign-in process', error);
      throw new InternalServerErrorException('An internal error occurred');
    }
  }
}
