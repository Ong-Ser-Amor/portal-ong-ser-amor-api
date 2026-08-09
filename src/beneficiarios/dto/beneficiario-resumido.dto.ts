import { ApiProperty } from '@nestjs/swagger';

import { PessoaResumidaDto } from '../../pessoas/dto/pessoa-resumida.dto';
import { Beneficiario } from '../entities/beneficiario.entity';
import {
  EstadoCivil,
  NivelEscolaridade,
  VinculoEmpregaticio,
} from '../enums/beneficiario.enum';

export class BeneficiarioResumidoDto {
  @ApiProperty({ example: 'ben-123' })
  id: string;

  @ApiProperty({ example: '456' })
  familiaId: string;

  @ApiProperty({ type: PessoaResumidaDto })
  pessoa: PessoaResumidaDto;

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
    this.familiaId = beneficiario.familiaId;
    this.pessoa = new PessoaResumidaDto(beneficiario.pessoa);
    this.nivelEscolaridade = beneficiario.nivelEscolaridade;
    this.estadoCivil = beneficiario.estadoCivil;
    this.vinculoEmpregaticio = beneficiario.vinculoEmpregaticio;
    this.quantidadeFilhos = beneficiario.quantidadeFilhos;
  }
}
