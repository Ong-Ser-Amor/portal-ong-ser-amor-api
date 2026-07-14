import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { compararSenha } from 'src/shared/utils/senha';

import { LoginDto } from './dto/login.dto';
import { PayloadJwtDto } from './dto/payload-jwt.dto';

@Injectable()
export class AutenticacaoService {
  private readonly logger = new Logger(AutenticacaoService.name);

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const usuario = await this.usuariosService.buscarPorEmailComSenha(
        loginDto.email,
      );

      if (!usuario) {
        throw new UnauthorizedException('E-mail ou senha inválidos.');
      }

      const senhaConfere = await compararSenha(
        loginDto.senha,
        usuario.senhaHash,
      );

      if (!senhaConfere) {
        throw new UnauthorizedException('E-mail ou senha inválidos.');
      }

      const payload = new PayloadJwtDto(usuario);
      const tokenAcesso = this.jwtService.sign({ ...payload });

      return {
        tokenAcesso,
        usuario,
      };
    } catch (erro) {
      if (erro instanceof UnauthorizedException) {
        throw erro;
      }
      this.logger.error('Erro durante o processo de login', erro);
      throw new InternalServerErrorException(
        'Ocorreu um erro interno ao tentar fazer login.',
      );
    }
  }
}
