import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/dtos/api-paginated-response.decorator';
import { PaginatedResponseDto } from 'src/dtos/paginated-response.dto';

import { AssetCategoriesService } from './asset-categories.service';
import { AssetCategoryResponseDto } from './dto/asset-category-response.dto';
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto';
import { UpdateAssetCategoryDto } from './dto/update-asset-category.dto';
import { AssetCategory } from './entities/asset-category.entity';

@Controller('asset-categories')
@ApiTags('Asset Categories')
export class AssetCategoriesController {
  constructor(
    private readonly assetCategoriesService: AssetCategoriesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The asset category has been successfully created',
    type: AssetCategory,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Asset category already exists',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(
    @Body() createAssetCategoryDto: CreateAssetCategoryDto,
  ): Promise<AssetCategoryResponseDto> {
    return new AssetCategoryResponseDto(
      await this.assetCategoriesService.create(createAssetCategoryDto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all asset categories' })
  @ApiPaginatedResponse(AssetCategoryResponseDto)
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findAll(
    @Query('take', ParseIntPipe) take: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
  ): Promise<PaginatedResponseDto<AssetCategoryResponseDto>> {
    const assetCategories = await this.assetCategoriesService.findAll(
      take,
      page,
    );

    const assetCategoryDtos = assetCategories.data.map(
      (assetCategory) => new AssetCategoryResponseDto(assetCategory),
    );

    return new PaginatedResponseDto<AssetCategoryResponseDto>(
      assetCategoryDtos,
      assetCategories.meta.totalItems,
      assetCategories.meta.itemsPerPage,
      assetCategories.meta.currentPage,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a asset category by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The asset category has been successfully retrieved',
    type: AssetCategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Asset category not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AssetCategoryResponseDto> {
    return new AssetCategoryResponseDto(
      await this.assetCategoriesService.findOne(id),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a asset category by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The asset category has been successfully updated',
    type: AssetCategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Asset category not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Asset category already exists',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssetCategoryDto: UpdateAssetCategoryDto,
  ): Promise<AssetCategoryResponseDto> {
    return new AssetCategoryResponseDto(
      await this.assetCategoriesService.update(id, updateAssetCategoryDto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a asset category by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The asset category has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Asset category not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.assetCategoriesService.remove(id);
  }
}
