import { ApiProperty } from '@nestjs/swagger';

import { Aula } from '../entities/aula.entity';
import { StatusAula } from '../enums/status-aula.enum';

export class AulaRespostaDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: '1' })
  turmaId: string;

  @ApiProperty({ example: '2026-09-26' })
  data: string;

  @ApiProperty({ example: 'Aula 3' })
  tema: string;

  @ApiProperty({ enum: StatusAula, example: StatusAula.AGENDADA })
  status: StatusAula;

  constructor(aula: Aula) {
    this.id = aula.id;
    this.turmaId = aula.turmaId;
    const dataValor = aula.data as string | Date;
    this.data =
      typeof dataValor === 'string'
        ? dataValor.split('T')[0]
        : dataValor instanceof Date
          ? dataValor.toISOString().split('T')[0]
          : String(dataValor);
    this.tema = aula.tema;
    this.status = aula.status;
  }
}
