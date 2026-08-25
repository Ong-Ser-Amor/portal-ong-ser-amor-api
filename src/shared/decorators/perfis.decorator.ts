import { SetMetadata } from '@nestjs/common';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

export const CHAVE_PERFIS = 'perfis';
export const Perfis = (...perfis: PerfilAcesso[]) =>
  SetMetadata(CHAVE_PERFIS, perfis);
