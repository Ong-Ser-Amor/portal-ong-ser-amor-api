import { SetMetadata } from '@nestjs/common';

export const CHAVE_ROTA_PUBLICA = 'rotaPublica';
export const Publico = () => SetMetadata(CHAVE_ROTA_PUBLICA, true);
