import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { PayloadJwtDto } from 'src/autenticacao/dto/payload-jwt.dto';
import { RequestComUsuario } from 'src/autenticacao/guards/jwt-auth.guard';

export const UsuarioLogado = createParamDecorator(
  (data: keyof PayloadJwtDto | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestComUsuario>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado na requisição.');
    }

    return data ? user[data] : user;
  },
);
