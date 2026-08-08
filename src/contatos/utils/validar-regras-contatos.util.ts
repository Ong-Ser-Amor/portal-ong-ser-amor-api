import { BadRequestException } from '@nestjs/common';
import { TipoContato } from '../enums/tipo-contato.enum';

export interface ContatoValidadorInput {
  tipoContato: TipoContato;
  ehPrincipal?: boolean;
}

/**
 * Valida o conjunto de contatos de uma pessoa segundo as regras de negócio:
 * 1. Mínimo 1 e máximo 3 contatos no total.
 * 2. Mínimo 1 e máximo 2 contatos telefónicos (CELULAR ou TELEFONE_FIXO).
 * 3. Máximo 1 contato do tipo E-MAIL.
 * 4. Exatamente 1 contato marcado como principal (ehPrincipal: true).
 * 5. O contato principal NÃO pode ser do tipo E-MAIL.
 */
export function validarRegrasContatos(contatos: ContatoValidadorInput[]): void {
  if (!contatos || contatos.length === 0) {
    throw new BadRequestException(
      'É obrigatório cadastrar pelo menos 1 contato.',
    );
  }

  if (contatos.length > 3) {
    throw new BadRequestException(
      'É permitido cadastrar no máximo 3 contatos por pessoa.',
    );
  }

  const contatosTelefónicos = contatos.filter(
    (c) =>
      c.tipoContato === TipoContato.CELULAR ||
      c.tipoContato === TipoContato.TELEFONE_FIXO,
  );

  if (contatosTelefónicos.length === 0) {
    throw new BadRequestException(
      'É obrigatório cadastrar pelo menos 1 contato telefónico (CELULAR ou TELEFONE_FIXO).',
    );
  }

  if (contatosTelefónicos.length > 2) {
    throw new BadRequestException(
      'É permitido no máximo 2 contatos telefónicos (CELULAR ou TELEFONE_FIXO).',
    );
  }

  const contatosEmail = contatos.filter(
    (c) => c.tipoContato === TipoContato.EMAIL,
  );

  if (contatosEmail.length > 1) {
    throw new BadRequestException(
      'É permitido no máximo 1 contato do tipo E-MAIL.',
    );
  }

  const contatosPrincipais = contatos.filter((c) => c.ehPrincipal === true);

  if (contatosPrincipais.length === 0) {
    throw new BadRequestException(
      'É obrigatório definir exatamente 1 contato como principal (ehPrincipal: true).',
    );
  }

  if (contatosPrincipais.length > 1) {
    throw new BadRequestException(
      'Apenas 1 contato pode ser definido como principal.',
    );
  }

  if (contatosPrincipais[0].tipoContato === TipoContato.EMAIL) {
    throw new BadRequestException(
      'O contato do tipo E-MAIL não pode ser definido como principal.',
    );
  }
}
