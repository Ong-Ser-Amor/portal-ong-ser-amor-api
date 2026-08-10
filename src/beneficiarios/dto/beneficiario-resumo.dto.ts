import { ApiProperty } from '@nestjs/swagger';

import { PessoaResumoDto } from '../../pessoas/dto/pessoa-resumo.dto';
import { Beneficiario } from '../entities/beneficiario.entity';
import {
  EstadoCivil,
  NivelEscolaridade,
  VinculoEmpregaticio,
} from '../enums/beneficiario.enum';

export class BeneficiarioResumoDto {
  @ApiProperty({ example: 'ben-123' })
  id: string;

  @ApiProperty({ example: '456' })
  familiaId: string;

  @ApiProperty({ type: PessoaResumoDto })
  pessoa: PessoaResumoDto;

  @ApiProperty({
    enum: NivelEscolaridade,
    example: NivelEscolaridade.ENSINO_FUNDAMENTAL_COMPLETO,
  })
  nivelEscolaridade: NivelEscolaridade;

  @ApiProperty({
    enum: EstadoCivil,
    example: EstadoCivil.SOLTEIRO,
    nullable: true,
  })
  estadoCivil: EstadoCivil | null;

  @ApiProperty({
    enum: VinculoEmpregaticio,
    example: VinculoEmpregaticio.DESEMPREGADO,
    nullable: true,
  })
  vinculoEmpregaticio: VinculoEmpregaticio | null;

  @ApiProperty({ example: 2, nullable: true })
  quantidadeFilhos: number | null;

  constructor(beneficiario: Beneficiario) {
    this.id = beneficiario.id;
    this.familiaId = beneficiario.familiaId;
    this.pessoa = new PessoaResumoDto(beneficiario.pessoa);
    this.nivelEscolaridade = beneficiario.nivelEscolaridade;
    this.estadoCivil = beneficiario.estadoCivil;
    this.vinculoEmpregaticio = beneficiario.vinculoEmpregaticio;
    this.quantidadeFilhos = beneficiario.quantidadeFilhos;
  }
}
