import { ApiProperty } from '@nestjs/swagger';
import { FamiliaRespostaDto } from 'src/familias/dto/familia-resposta.dto';

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

  @ApiProperty({ type: FamiliaRespostaDto })
  familia: FamiliaRespostaDto;

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
    this.familia = new FamiliaRespostaDto(beneficiario.familia);
    this.nivelEscolaridade = beneficiario.nivelEscolaridade;
    this.estadoCivil = beneficiario.estadoCivil;
    this.vinculoEmpregaticio = beneficiario.vinculoEmpregaticio;
    this.quantidadeFilhos = beneficiario.quantidadeFilhos;
  }
}
