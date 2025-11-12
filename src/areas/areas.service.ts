import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponseDto } from 'src/dtos/paginated-response.dto';
import { LocationsService } from 'src/locations/locations.service';
import { EntityNotFoundError, Repository } from 'typeorm';

import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Area } from './entities/area.entity';

@Injectable()
export class AreasService {
  private readonly logger = new Logger(AreasService.name);

  constructor(
    @InjectRepository(Area)
    private readonly repository: Repository<Area>,
    private readonly locationsService: LocationsService,
  ) {}

  async create(createAreaDto: CreateAreaDto): Promise<Area> {
    const location = await this.locationsService.findOne(
      createAreaDto.locationId,
    );

    try {
      const area = this.repository.create({
        ...createAreaDto,
        location,
      });
      return await this.repository.save(area);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error creating area: ${errorMessage}`);
      throw new InternalServerErrorException('Error creating area');
    }
  }

  async findAllByLocationId(
    locationId: number,
    take = 10,
    page = 1,
  ): Promise<PaginatedResponseDto<Area>> {
    await this.locationsService.findOne(locationId);

    try {
      const skip = (page - 1) * take;

      const [areas, total] = await this.repository.findAndCount({
        where: { locationId: locationId },
        take,
        skip,
        order: { name: 'ASC' },
      });

      return new PaginatedResponseDto<Area>(areas, total, take, page);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error finding area by location id: ${errorMessage}`);
      throw new InternalServerErrorException(
        'Error finding area by location id',
      );
    }
  }

  async findOne(id: number): Promise<Area> {
    try {
      return this.repository.findOneByOrFail({ id });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Area not found');
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error finding area: ${errorMessage}`);
      throw new InternalServerErrorException('Error finding area');
    }
  }

  async update(id: number, updateAreaDto: UpdateAreaDto): Promise<Area> {
    const area = await this.findOne(id);

    try {
      this.repository.merge(area, updateAreaDto);
      return await this.repository.save(area);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error updating area: ${errorMessage}`);
      throw new InternalServerErrorException('Error updating area');
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
      this.logger.error(`Error deleting area: ${errorMessage}`);
      throw new InternalServerErrorException('Error deleting area');
    }
  }
}
