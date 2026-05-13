import { ApiProperty } from '@nestjs/swagger';

import { PessoaRespostaDto } from '../../pessoas/dto/pessoa-resposta.dto';
import { Voluntario } from '../entities/voluntario.entity';
import { StatusFormacao, TipoVoluntario } from '../enums/voluntario.enum';

export class VoluntarioRespostaDto {
  @ApiProperty({ example: 'vol-123' })
  id: string;

  @ApiProperty({ type: PessoaRespostaDto })
  pessoa: PessoaRespostaDto;

  @ApiProperty({ type: String, example: 'Pedagogia' })
  formacaoAcademica: string | null;

  @ApiProperty({
    enum: StatusFormacao,
    example: StatusFormacao.COMPLETO,
    required: false,
  })
  statusFormacao: StatusFormacao | null;

  @ApiProperty({
    enum: TipoVoluntario,
    example: TipoVoluntario.PROFESSOR,
  })
  tipoVoluntario: TipoVoluntario;

  constructor(voluntario: Voluntario) {
    this.id = voluntario.id;
    this.pessoa = new PessoaRespostaDto(voluntario.pessoa);
    this.formacaoAcademica = voluntario.formacaoAcademica;
    this.statusFormacao = voluntario.statusFormacao;
    this.tipoVoluntario = voluntario.tipoVoluntario;
  }
}
