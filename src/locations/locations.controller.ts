import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AreasService } from 'src/areas/areas.service';
import { AreaResponseDto } from 'src/areas/dto/area-response.dto';
import { ApiPaginatedResponse } from 'src/dtos/api-paginated-response.decorator';
import { PaginatedResponseDto } from 'src/dtos/paginated-response.dto';

import { CreateLocationDto } from './dto/create-location.dto';
import { LocationResponseDto } from './dto/location-response.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';

@Controller('locations')
@ApiTags('Locations')
export class LocationsController {
  constructor(
    private readonly locationsService: LocationsService,
    private readonly areasService: AreasService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The location has been successfully created',
    type: LocationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<LocationResponseDto> {
    return new LocationResponseDto(
      await this.locationsService.create(createLocationDto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all locations' })
  @ApiPaginatedResponse(LocationResponseDto)
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findAll(
    @Query('take', ParseIntPipe) take: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
  ): Promise<PaginatedResponseDto<LocationResponseDto>> {
    const locations = await this.locationsService.findAll(take, page);

    const locationDtos = locations.data.map(
      (location) => new LocationResponseDto(location),
    );

    return new PaginatedResponseDto<LocationResponseDto>(
      locationDtos,
      locations.meta.totalItems,
      locations.meta.itemsPerPage,
      locations.meta.currentPage,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a location by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The location has been successfully retrieved',
    type: LocationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LocationResponseDto> {
    return new LocationResponseDto(await this.locationsService.findOne(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The location has been successfully updated',
    type: LocationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<LocationResponseDto> {
    return new LocationResponseDto(
      await this.locationsService.update(id, updateLocationDto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a location by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The location has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.locationsService.remove(id);
  }

  @Get(':id/areas')
  @ApiOperation({ summary: 'Get all areas from a location' })
  @ApiPaginatedResponse(AreaResponseDto)
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Location not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findCourseClasses(
    @Param('id', ParseIntPipe) id: number,
    @Query('take', ParseIntPipe) take: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
  ): Promise<PaginatedResponseDto<AreaResponseDto>> {
    const areas = await this.areasService.findAllByLocationId(id, take, page);

    const areaDtos = areas.data.map((area) => new AreaResponseDto(area));

    return new PaginatedResponseDto<AreaResponseDto>(
      areaDtos,
      areas.meta.totalItems,
      areas.meta.itemsPerPage,
      areas.meta.currentPage,
    );
  }
}
