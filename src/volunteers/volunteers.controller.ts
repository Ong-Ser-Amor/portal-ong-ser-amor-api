import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/decorators/is-public.decorator';

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
  findAll() {
    return this.volunteersService.findAll();
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
  update(
    @Param('id') id: string,
    @Body() updateVolunteerDto: UpdateVolunteerDto,
  ) {
    return this.volunteersService.update(+id, updateVolunteerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.volunteersService.remove(+id);
  }
}
