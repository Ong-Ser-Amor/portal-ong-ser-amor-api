import { ApiProperty } from '@nestjs/swagger';
import { FamiliaRespostaDto } from 'src/familias/dto/familia-resposta.dto';

import { PessoaDto } from '../../pessoas/dto/pessoa.dto';
import { Beneficiario } from '../entities/beneficiario.entity';
import {
  EstadoCivil,
  NivelEscolaridade,
  VinculoEmpregaticio,
} from '../enums/beneficiario.enum';

export class BeneficiarioDto {
  @ApiProperty({ example: 'ben-123' })
  id: string;

  @ApiProperty({ type: PessoaDto })
  pessoa: PessoaDto;

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
    this.pessoa = new PessoaDto(beneficiario.pessoa);
    this.familia = new FamiliaRespostaDto(beneficiario.familia);
    this.nivelEscolaridade = beneficiario.nivelEscolaridade;
    this.estadoCivil = beneficiario.estadoCivil;
    this.vinculoEmpregaticio = beneficiario.vinculoEmpregaticio;
    this.quantidadeFilhos = beneficiario.quantidadeFilhos;
  }
}
