import { PayloadLoginDto } from '../auth/dto/payload-login.dto';

export const autorizacaoParaPayloadLogin = (
  autorizacao: string,
): PayloadLoginDto | undefined => {
  const autorizacaoDividida = autorizacao.split('.');

  if (autorizacaoDividida.length < 3 || !autorizacaoDividida[1]) {
    return undefined;
  }

  return JSON.parse(
    Buffer.from(autorizacaoDividida[1], 'base64').toString('ascii'),
  ) as PayloadLoginDto;
};
