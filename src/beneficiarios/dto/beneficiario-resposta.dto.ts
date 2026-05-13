import { ApiProperty } from '@nestjs/swagger';

import { PessoaRespostaDto } from '../../pessoas/dto/pessoa-resposta.dto';
import { Beneficiario } from '../entities/beneficiario.entity';
import {
  EstadoCivil,
  NivelEscolaridade,
  VinculoEmpregaticio,
} from '../enums/beneficiario.enum';

export class BeneficiarioRespostaDto {
  @ApiProperty({ example: 'ben-123' })
  id: string;

  @ApiProperty({ type: PessoaRespostaDto })
  pessoa: PessoaRespostaDto;

  @ApiProperty({ example: 'fam-456' })
  familiaId: string;

  @ApiProperty({
    enum: NivelEscolaridade,
    example: NivelEscolaridade.ENSINO_FUNDAMENTAL_COMPLETO,
  })
  nivelEscolaridade: NivelEscolaridade;

  @ApiProperty({
    enum: EstadoCivil,
    example: EstadoCivil.SOLTEIRO,
    required: false,
  })
  estadoCivil?: EstadoCivil;

  @ApiProperty({
    enum: VinculoEmpregaticio,
    example: VinculoEmpregaticio.DESEMPREGADO,
    required: false,
  })
  vinculoEmpregaticio?: VinculoEmpregaticio;

  @ApiProperty({ example: 2, nullable: true })
  quantidadeFilhos: number | null;

  constructor(beneficiario: Beneficiario) {
    this.id = beneficiario.id;
    this.pessoa = new PessoaRespostaDto(beneficiario.pessoa);
    this.familiaId = beneficiario.familiaId;
    this.nivelEscolaridade = beneficiario.nivelEscolaridade;
    this.estadoCivil = beneficiario.estadoCivil;
    this.vinculoEmpregaticio = beneficiario.vinculoEmpregaticio;
    this.quantidadeFilhos = beneficiario.quantidadeFilhos;
  }
}
