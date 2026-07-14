import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

import { PaginacaoRespostaDto } from '../dtos/paginacao-resposta.dto';

export const ApiPaginacaoResposta = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(PaginacaoRespostaDto, model),
    ApiOkResponse({
      description: 'Resposta paginada recebida com sucesso.',
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginacaoRespostaDto) },
          {
            properties: {
              dados: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
