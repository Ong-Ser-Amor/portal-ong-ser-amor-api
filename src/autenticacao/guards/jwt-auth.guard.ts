import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CHAVE_ROTA_PUBLICA } from 'src/shared/decorators/publico.decorator';

import { PayloadJwtDto } from '../dto/payload-jwt.dto';

export interface RequestComUsuario extends Request {
  user: PayloadJwtDto;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Verifica se a rota tem o @Publico()
    const ePublico = this.reflector.getAllAndOverride<boolean>(
      CHAVE_ROTA_PUBLICA,
      [context.getHandler(), context.getClass()],
    );

    if (ePublico) {
      return true;
    }

    // 2. Extrai o token
    const requisicao = context.switchToHttp().getRequest<RequestComUsuario>();
    const token = this.extrairTokenDoCabecalho(requisicao);

    if (!token) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    // 3. Verifica a validade do token
    try {
      const segredo = this.configService.get<string>('JWT_SECRET_KEY');
      const payload = await this.jwtService.verifyAsync<PayloadJwtDto>(token, {
        secret: segredo,
      });

      // Anexa os dados do usuário (id e nome) na requisição para as próximas rotas usarem
      requisicao.user = payload;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    return true;
  }

  private extrairTokenDoCabecalho(requisicao: Request): string | null {
    const cabecalhoAuth = requisicao.headers.authorization;
    if (!cabecalhoAuth) {
      return null;
    }

    const [tipo, token] = cabecalhoAuth.split(' ');
    if (tipo !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
