import { ApiProperty } from '@nestjs/swagger';

import { AssetCategory } from '../entities/asset-category.entity';

export class AssetCategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Computadores' })
  name: string;

  constructor(assetCategory: AssetCategory) {
    this.id = assetCategory.id;
    this.name = assetCategory.name;
  }
}
