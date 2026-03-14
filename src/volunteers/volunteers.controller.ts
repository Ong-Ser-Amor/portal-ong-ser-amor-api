import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/decorators/is-public.decorator';
import { ApiPaginatedResponse } from 'src/dtos/api-paginated-response.decorator';
import { PaginatedResponseDto } from 'src/dtos/paginated-response.dto';

import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { VolunteerResponseDto } from './dto/volunteer-response.dto';
import { VolunteersService } from './volunteers.service';

@ApiTags('Volunteers')
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new volunteer' })
  @ApiCreatedResponse({
    description: 'The volunteer has been successfully created.',
    type: VolunteerResponseDto,
  })
  @ApiConflictResponse({
    description: 'A volunteer with the same CPF already exists.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred while creating the volunteer.',
  })
  async create(
    @Body() createVolunteerDto: CreateVolunteerDto,
  ): Promise<VolunteerResponseDto> {
    const createdVolunteer =
      await this.volunteersService.create(createVolunteerDto);
    return new VolunteerResponseDto(createdVolunteer);
  }

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of volunteers' })
  @ApiPaginatedResponse(VolunteerResponseDto)
  @ApiInternalServerErrorResponse({
    description: 'An unexpected error occurred while retrieving volunteers.',
  })
  async findAll(
    @Query('take') take = 10,
    @Query('skip') skip = 0,
  ): Promise<PaginatedResponseDto<VolunteerResponseDto>> {
    const paginatedVolunteers = await this.volunteersService.findAll(
      take,
      skip,
    );
    const volunteerDtos = paginatedVolunteers.data.map(
      (volunteer) => new VolunteerResponseDto(volunteer),
    );
    return new PaginatedResponseDto(
      volunteerDtos,
      paginatedVolunteers.meta.totalItems,
      paginatedVolunteers.meta.itemsPerPage,
      paginatedVolunteers.meta.currentPage,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get volunteer by ID' })
  @ApiOkResponse({
    description: 'The volunteer has been successfully retrieved.',
  })
  @ApiNotFoundResponse({
    description: 'Volunteer not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async findOne(@Param('id') id: string): Promise<VolunteerResponseDto> {
    const volunteer = await this.volunteersService.findOne(id);
    return new VolunteerResponseDto(volunteer);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update volunteer by ID' })
  @ApiOkResponse({
    description: 'The volunteer has been successfully updated.',
    type: VolunteerResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Volunteer not found',
  })
  @ApiConflictResponse({
    description: 'A volunteer with the same CPF already exists.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async update(
    @Param('id') id: string,
    @Body() updateVolunteerDto: UpdateVolunteerDto,
  ): Promise<VolunteerResponseDto> {
    const updatedVolunteer = await this.volunteersService.update(
      id,
      updateVolunteerDto,
    );
    return new VolunteerResponseDto(updatedVolunteer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete volunteer by ID' })
  @ApiNoContentResponse({
    description: 'The volunteer has been successfully deleted.',
  })
  @ApiNotFoundResponse({
    description: 'Volunteer not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.volunteersService.remove(id);
  }
}
