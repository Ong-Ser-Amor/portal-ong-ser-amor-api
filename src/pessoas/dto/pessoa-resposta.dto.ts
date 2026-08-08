import { ApiProperty } from '@nestjs/swagger';

import { Pessoa } from '../entities/pessoa.entity';

export class PessoaRespostaDto {
  @ApiProperty({ example: '123456' })
  id: string;

  @ApiProperty({ example: 'Carlos Santos' })
  nome: string;

  @ApiProperty({ example: '12345678900' })
  cpf: string;

  @ApiProperty({ type: String, format: 'date', example: '2000-01-01' })
  dataNascimento: Date;

  @ApiProperty({ example: true })
  podeSairSozinho?: boolean;

  @ApiProperty({ example: false })
  emancipado: boolean;

  @ApiProperty({ example: '123456' })
  responsavelId?: string;

  constructor(pessoa: Pessoa) {
    this.id = pessoa.id;
    this.nome = pessoa.nome;
    this.cpf = pessoa.cpf;
    this.dataNascimento = pessoa.dataNascimento;
    this.podeSairSozinho = pessoa.podeSairSozinho;
    this.emancipado = pessoa.emancipado;
    this.responsavelId = pessoa.responsavelId;
  }
}
