import { PayloadJwtDto } from 'src/autenticacao/dto/payload-jwt.dto';

export const autorizacaoParaPayloadLogin = (
  autorizacao: string,
): PayloadJwtDto | undefined => {
  const autorizacaoDividida = autorizacao.split('.');

  if (autorizacaoDividida.length < 3 || !autorizacaoDividida[1]) {
    return undefined;
  }

  return JSON.parse(
    Buffer.from(autorizacaoDividida[1], 'base64').toString('ascii'),
  ) as PayloadJwtDto;
};
