import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHAVE_PERFIS } from 'src/shared/decorators/perfis.decorator';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

import { RequestComUsuario } from './jwt-auth.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfisNecessarios = this.reflector.getAllAndOverride<PerfilAcesso[]>(
      CHAVE_PERFIS,
      [context.getHandler(), context.getClass()],
    );

    if (!perfisNecessarios || perfisNecessarios.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestComUsuario>();

    if (!user || !user.perfisAcesso) {
      throw new ForbiddenException(
        'Acesso não autorizado para o perfil do usuário.',
      );
    }

    if (user.perfisAcesso.includes(PerfilAcesso.ADMINISTRADOR)) {
      return true;
    }

    const possuiPerfil = perfisNecessarios.some((perfil) =>
      user.perfisAcesso.includes(perfil),
    );

    if (!possuiPerfil) {
      throw new ForbiddenException(
        'Acesso não autorizado para o perfil do usuário.',
      );
    }

    return true;
  }
}
