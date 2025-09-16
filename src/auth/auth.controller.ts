import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/is-public.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { ReturnSignInDto } from './dto/return-sign-in.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto): Promise<ReturnSignInDto> {
    if (!signInDto) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    return new ReturnSignInDto(await this.authService.signIn(signInDto));
  }
}
