import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/dtos/api-paginated-response.decorator';

import { AreasService } from './areas.service';
import { AreaResponseDto } from './dto/area-response.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Controller('areas')
@ApiTags('Areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new area' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The area has been successfully created',
    type: AreaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(@Body() createAreaDto: CreateAreaDto): Promise<AreaResponseDto> {
    return new AreaResponseDto(await this.areasService.create(createAreaDto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get area by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The area has been successfully retrieved.',
    type: AreaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Area not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AreaResponseDto> {
    return new AreaResponseDto(await this.areasService.findOne(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an area' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The area has been successfully updated',
    type: AreaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Area not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAreaDto: UpdateAreaDto,
  ): Promise<AreaResponseDto> {
    return new AreaResponseDto(
      await this.areasService.update(id, updateAreaDto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a area by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The area has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Area not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.areasService.remove(id);
  }
}
