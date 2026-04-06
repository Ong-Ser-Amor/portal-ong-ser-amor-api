import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

import { autorizacaoParaPayloadLogin } from '../utils/conversor-base64';

export const UsuarioDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const autorizacao = request.headers.authorization;

    if (!autorizacao || typeof autorizacao !== 'string') {
      throw new BadRequestException('Cabeçalho de autorização não encontrado.');
    }

    const payloadLoginDto = autorizacaoParaPayloadLogin(
      autorizacao.replace('Bearer ', ''),
    );

    return payloadLoginDto?.id;
  },
);
