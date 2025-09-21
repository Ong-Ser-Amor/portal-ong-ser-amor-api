import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from 'src/utils/password';

import { SignInPayloadDto } from './dto/sign-in-payload.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const user: User | undefined = (await this.userService
      .findOneByEmailWithPassword(signInDto.email)
      .catch(() => undefined)) as User | undefined;

    if (
      !user ||
      !(await comparePassword(signInDto.password, user.passwordHash || ''))
    ) {
      throw new UnauthorizedException('Email or password invalid!');
    }

    return {
      access_token: this.jwtService.sign({
        ...new SignInPayloadDto(user),
      }),
      user: user,
    };
  }
}
