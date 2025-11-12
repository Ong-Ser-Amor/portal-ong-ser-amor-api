import { ApiProperty } from '@nestjs/swagger';

import { Area } from '../entities/area.entity';

export class AreaResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sala de Aula' })
  name: string;

  @ApiProperty({ example: 1 })
  locationId: number;

  constructor(area: Area) {
    this.id = area.id;
    this.name = area.name;
    this.locationId = area.locationId;
  }
}
