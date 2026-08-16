import { ApiProperty } from '@nestjs/swagger';
import { PessoaResumoDto } from 'src/pessoas/dto/pessoa-resumo.dto';

import { Voluntario } from '../entities/voluntario.entity';
import { StatusFormacao, TipoVoluntario } from '../enums/voluntario.enum';

export class VoluntarioResumoDto {
  @ApiProperty({ example: 'vol-123' })
  id: string;

  @ApiProperty({ type: PessoaResumoDto })
  pessoa: PessoaResumoDto;

  @ApiProperty({ type: String, example: 'Pedagogia', nullable: true })
  formacaoAcademica: string | null;

  @ApiProperty({
    enum: StatusFormacao,
    example: StatusFormacao.COMPLETO,
    nullable: true,
  })
  statusFormacao: StatusFormacao | null;

  @ApiProperty({
    enum: TipoVoluntario,
    example: TipoVoluntario.PROFESSOR,
  })
  tipoVoluntario: TipoVoluntario;

  constructor(voluntario: Voluntario) {
    this.id = voluntario.id;
    this.pessoa = new PessoaResumoDto(voluntario.pessoa);
    this.formacaoAcademica = voluntario.formacaoAcademica;
    this.statusFormacao = voluntario.statusFormacao;
    this.tipoVoluntario = voluntario.tipoVoluntario;
  }
}
