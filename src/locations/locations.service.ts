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

import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    @InjectRepository(Location)
    private readonly repository: Repository<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const existingLocation = await this.repository.findOneBy({
      name: createLocationDto.name,
    });
    if (existingLocation) {
      throw new ConflictException('Location already exists');
    }

    try {
      const location = this.repository.create(createLocationDto);
      return await this.repository.save(location);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error creating location: ${errorMessage}`);
      throw new InternalServerErrorException('Error creating location');
    }
  }

  async findAll(take = 10, page = 1): Promise<PaginatedResponseDto<Location>> {
    try {
      const skip = (page - 1) * take;

      const [locations, total] = await this.repository.findAndCount({
        take,
        skip,
        order: { name: 'ASC' },
      });

      return new PaginatedResponseDto<Location>(locations, total, take, page);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error finding locations: ${errorMessage}`);
      throw new InternalServerErrorException('Error finding locations');
    }
  }

  async findOne(id: number): Promise<Location> {
    try {
      return this.repository.findOneByOrFail({ id });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Location not found');
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error finding location by id: ${errorMessage}`);
      throw new InternalServerErrorException('Error finding location by id');
    }
  }

  async update(
    id: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.findOne(id);

    try {
      this.repository.merge(location, updateLocationDto);
      return await this.repository.save(location);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error updating location: ${errorMessage}`);
      throw new InternalServerErrorException('Error updating location');
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
      this.logger.error(`Error removing location: ${errorMessage}`);
      throw new InternalServerErrorException('Error removing location');
    }
  }
}
