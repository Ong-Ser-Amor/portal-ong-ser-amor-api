import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import { authorizationToLoginPayload } from './../utils/base-64.converter';

export const UserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    if (!authorization || typeof authorization !== 'string') {
      throw new BadRequestException('Authorization header not found');
    }

    const loginPayloadDto = authorizationToLoginPayload(
      authorization.replace('Bearer ', ''),
    );

    return loginPayloadDto?.id;
  },
);
