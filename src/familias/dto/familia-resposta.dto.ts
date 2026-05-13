import { Familia } from '../entities/familia.entity';
import { FaixaRenda } from '../enums/faixa-renda.enum';
import { TipoMoradia } from '../enums/tipo-moradia.enum';

export class FamiliaRespostaDto {
  id: string;
  faixaRenda: FaixaRenda;
  possuiBeneficioSocial: boolean;
  tipoMoradia: TipoMoradia;
  enderecoId: string;

  constructor(familia: Familia) {
    this.id = familia.id;
    this.faixaRenda = familia.faixaRenda;
    this.possuiBeneficioSocial = familia.possuiBeneficioSocial;
    this.tipoMoradia = familia.tipoMoradia;
    this.enderecoId = familia.enderecoId;
  }
}
