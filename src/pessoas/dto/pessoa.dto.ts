import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ContatoRespostaDto } from '../../contatos/dto/contato-resposta.dto';
import { PessoaContato } from '../entities/pessoa-contato.entity';
import { Pessoa } from '../entities/pessoa.entity';

export class PessoaDto {
  @ApiProperty({ example: '123456' })
  id: string;

  @ApiProperty({ example: 'Carlos Santos' })
  nome: string;

  @ApiProperty({ example: '12345678900' })
  cpf: string;

  @ApiProperty({ type: String, format: 'date', example: '2000-01-01' })
  dataNascimento: Date;

  @ApiProperty({ example: true, nullable: true })
  podeSairSozinho: boolean | null;

  @ApiProperty({ example: false })
  emancipado: boolean;

  @ApiProperty({ example: '123456', nullable: true })
  responsavelId: string | null;

  @ApiPropertyOptional({ type: [ContatoRespostaDto] })
  contatos?: ContatoRespostaDto[];

  constructor(pessoa: Pessoa) {
    this.id = pessoa.id;
    this.nome = pessoa.nome;
    this.cpf = pessoa.cpf;
    this.dataNascimento = pessoa.dataNascimento;
    this.podeSairSozinho = pessoa.podeSairSozinho;
    this.emancipado = pessoa.emancipado;
    this.responsavelId = pessoa.responsavelId;
    if (pessoa.contatos) {
      this.contatos = pessoa.contatos
        .filter(
          (
            pessoaContato,
          ): pessoaContato is PessoaContato & {
            contato: NonNullable<PessoaContato['contato']>;
          } => Boolean(pessoaContato.contato),
        )
        .map(
          (pessoaContato) =>
            new ContatoRespostaDto(
              Object.assign(pessoaContato.contato, {
                ehPrincipal: pessoaContato.ehPrincipal,
              }),
            ),
        );
    }
  }
}
