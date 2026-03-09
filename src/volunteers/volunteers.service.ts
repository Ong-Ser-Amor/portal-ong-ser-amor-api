import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Person } from 'src/people/entities/person.entity';
import { DataSource } from 'typeorm';

import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { Volunteer } from './entities/volunteer.entity';

@Injectable()
export class VolunteersService {
  private readonly logger = new Logger(VolunteersService.name);

  constructor(private readonly dataSource: DataSource) {}

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
    }
  }

  findAll() {
    return `This action returns all volunteers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} volunteer`;
  }

  update(id: number, _updateVolunteerDto: UpdateVolunteerDto) {
    return `This action updates a #${id} volunteer`;
  }

  remove(id: number) {
    return `This action removes a #${id} volunteer`;
  }
}
