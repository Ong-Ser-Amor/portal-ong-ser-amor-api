import { PayloadJwtDto } from 'src/autenticacao/dto/payload-jwt.dto';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

const PERFIS_COM_ACESSO_IRRESTRITO_EM_CURSOS: PerfilAcesso[] = [
  PerfilAcesso.ADMINISTRADOR,
  PerfilAcesso.COORDENADOR_CURSOS,
];

export function temAcessoIrrestritoEmCursos(usuario: PayloadJwtDto): boolean {
  return usuario.perfis.some((perfil) =>
    PERFIS_COM_ACESSO_IRRESTRITO_EM_CURSOS.includes(perfil),
  );
}
