import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from 'src/people/entities/person.entity';
import { DataSource, EntityNotFoundError, Repository } from 'typeorm';

import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { Volunteer } from './entities/volunteer.entity';

@Injectable()
export class VolunteersService {
  private readonly logger = new Logger(VolunteersService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Volunteer)
    private readonly repository: Repository<Volunteer>,
  ) {}

  async create(createVolunteerDto: CreateVolunteerDto): Promise<Volunteer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const person = new Person({
        name: createVolunteerDto.name,
        cpf: createVolunteerDto.cpf,
        birthDate: createVolunteerDto.birthDate,
      });

      const savedPerson = await queryRunner.manager.save(person);

      const volunteer = new Volunteer({
        person: savedPerson,
        academicBackground: createVolunteerDto.academicBackground,
        educationStatus: createVolunteerDto.educationStatus,
        volunteerType: createVolunteerDto.volunteerType,
      });

      const savedVolunteer = await queryRunner.manager.save(volunteer);

      await queryRunner.commitTransaction();

      return savedVolunteer;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();

      // Log detalhado do erro para diagnóstico, sem expor detalhes sensíveis ao frontend
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${JSON.stringify(error)}`;

      this.logger.error(`Error creating volunteer: ${errorMessage}`);

      // Verifica se o erro é uma violação de chave única (código 23505 no PostgreSQL)
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as Record<string, unknown>).code === '23505'
      ) {
        throw new ConflictException('Person with this CPF already exists');
      }

      // Erro genérico para o frontend não ver detalhes sensíveis do banco
      throw new InternalServerErrorException('Error creating volunteer');
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all volunteers`;
  }

  async findOne(id: string): Promise<Volunteer> {
    try {
      return await this.repository.findOneOrFail({
        where: { id },
        relations: ['person'],
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`Volunteer with ID ${id} not found`);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error finding volunteer: ${errorMessage}`);
      throw new InternalServerErrorException('Error finding volunteer');
    }
  }

  async update(
    id: string,
    updateVolunteerDto: UpdateVolunteerDto,
  ): Promise<Volunteer> {
    const volunteer = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 3. Extraímos os dados que pertencem à Pessoa
      const { name, cpf, birthDate, ...volunteerUpdates } = updateVolunteerDto;

      let personUpdated = false;

      if (name !== undefined) {
        volunteer.person.name = name;
        personUpdated = true;
      }
      if (cpf !== undefined) {
        volunteer.person.cpf = cpf;
        personUpdated = true;
      }
      if (birthDate !== undefined) {
        volunteer.person.birthDate = birthDate;
        personUpdated = true;
      }

      if (personUpdated) {
        await queryRunner.manager.save(volunteer.person);
      }

      let volunteerUpdated: Volunteer | null = null;

      if (volunteerUpdates.academicBackground !== undefined) {
        volunteer.academicBackground = volunteerUpdates.academicBackground;
      }
      if (volunteerUpdates.educationStatus !== undefined) {
        volunteer.educationStatus = volunteerUpdates.educationStatus;
      }
      if (volunteerUpdates.volunteerType !== undefined) {
        volunteer.volunteerType = volunteerUpdates.volunteerType;
      }

      volunteerUpdated = await queryRunner.manager.save(volunteer);

      await queryRunner.commitTransaction();

      return volunteerUpdated;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();

      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${JSON.stringify(error)}`;

      this.logger.error(`Error updating volunteer: ${errorMessage}`);

      // Se tentarem atualizar para um CPF que já existe em outra pessoa:
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as Record<string, unknown>).code === '23505'
      ) {
        throw new ConflictException('Person with this CPF already exists');
      }

      throw new InternalServerErrorException('Error updating volunteer');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    try {
      await this.repository.softDelete(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error removing volunteer: ${errorMessage}`);
      throw new InternalServerErrorException('Error removing volunteer');
    }
  }
}
