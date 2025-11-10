import { ApiProperty } from '@nestjs/swagger';

import { Location } from '../entities/location.entity';

export class LocationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sede' })
  name: string;

  @ApiProperty({ example: 'Rua Oceano, 123' })
  address: string;

  constructor(location: Location) {
    this.id = location.id;
    this.name = location.name;
    this.address = location.address;
  }
}
