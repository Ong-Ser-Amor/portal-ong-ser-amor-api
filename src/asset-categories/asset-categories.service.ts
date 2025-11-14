import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponseDto } from 'src/dtos/paginated-response.dto';
import { EntityNotFoundError, Repository } from 'typeorm';

import { CreateAssetCategoryDto } from './dto/create-asset-category.dto';
import { UpdateAssetCategoryDto } from './dto/update-asset-category.dto';
import { AssetCategory } from './entities/asset-category.entity';

@Injectable()
export class AssetCategoriesService {
  private readonly logger = new Logger(AssetCategoriesService.name);

  constructor(
    @InjectRepository(AssetCategory)
    private readonly repository: Repository<AssetCategory>,
  ) {}

  async create(
    createAssetCategoryDto: CreateAssetCategoryDto,
  ): Promise<AssetCategory> {
    const existingAssetCategory = await this.findOneByName(
      createAssetCategoryDto.name,
    );

    if (existingAssetCategory) {
      throw new ConflictException('Asset category already exists');
    }

    try {
      const assetCategory = this.repository.create(createAssetCategoryDto);
      return await this.repository.save(assetCategory);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      Logger.error(`Error creating asset category: ${errorMessage}`);
      throw new InternalServerErrorException('Error creating asset category');
    }
  }

  async findAll(
    take = 10,
    page = 1,
  ): Promise<PaginatedResponseDto<AssetCategory>> {
    try {
      const skip = (page - 1) * take;

      const [locations, total] = await this.repository.findAndCount({
        take,
        skip,
        order: { name: 'ASC' },
      });

      return new PaginatedResponseDto<AssetCategory>(
        locations,
        total,
        take,
        page,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error finding asset categories: ${errorMessage}`);
      throw new InternalServerErrorException('Error finding asset categories');
    }
  }

  async findOneByName(name: string): Promise<AssetCategory | null> {
    try {
      return this.repository.findOne({
        where: { name },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(
        `Error finding asset category by name: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'Error finding asset category by name',
      );
    }
  }

  async findOne(id: number): Promise<AssetCategory> {
    try {
      return this.repository.findOneByOrFail({ id });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Asset category not found');
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error finding asset category by id: ${errorMessage}`);
      throw new InternalServerErrorException(
        'Error finding asset category by id',
      );
    }
  }

  async update(
    id: number,
    updateAssetCategoryDto: UpdateAssetCategoryDto,
  ): Promise<AssetCategory> {
    const assetCategory = await this.findOne(id);

    const existingAssetCategory = await this.findOneByName(
      updateAssetCategoryDto.name,
    );

    if (existingAssetCategory && existingAssetCategory.id !== id) {
      throw new ConflictException('Asset category already exists');
    }

    try {
      this.repository.merge(assetCategory, updateAssetCategoryDto);
      return await this.repository.save(assetCategory);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error updating asset category: ${errorMessage}`);
      throw new InternalServerErrorException('Error updating asset category');
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    try {
      await this.repository.softDelete(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error removing asset category: ${errorMessage}`);
      throw new InternalServerErrorException('Error removing asset category');
    }
  }
}
