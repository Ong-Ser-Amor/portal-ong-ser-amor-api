import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseClassStatus } from 'src/course-classes/enums/course-class-status.enum';
import { PaginatedResponseDto } from 'src/dtos/paginated-response.dto';
import { EntityNotFoundError, Repository } from 'typeorm';

import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    try {
      const course = this.repository.create(createCourseDto);
      return await this.repository.save(course);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      Logger.error(`Error creating course: ${errorMessage}`);
      throw new InternalServerErrorException('Error creating course');
    }
  }

  async findAll(take = 10, page = 1): Promise<PaginatedResponseDto<Course>> {
    try {
      const skip = (page - 1) * take;

      const queryBuilder = this.repository
        .createQueryBuilder('course')
        .loadRelationCountAndMap(
          'course.activeClassesCount',
          'course.courseClasses',
          'activeCourseClass',
          (qb) =>
            qb.where('activeCourseClass.status IN (:...statuses)', {
              statuses: [
                CourseClassStatus.EM_FORMACAO,
                CourseClassStatus.EM_ANDAMENTO,
              ],
            }),
        )
        .orderBy('course.name', 'ASC')
        .take(take)
        .skip(skip);

      const [courses, total] = await queryBuilder.getManyAndCount();

      return new PaginatedResponseDto(courses, total, take, page);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error finding all courses: ${errorMessage}`);
      throw new InternalServerErrorException('Error finding all courses');
    }
  }

  async findOne(id: number): Promise<Course> {
    try {
      return await this.repository.findOneByOrFail({ id });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Course not found');
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error finding course by id: ${errorMessage}`);
      throw new InternalServerErrorException('Error finding course by id');
    }
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const course = await this.findOne(id);

    try {
      this.repository.merge(course, updateCourseDto);
      return await this.repository.save(course);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error updating course: ${errorMessage}`);
      throw new InternalServerErrorException('Error updating course');
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
      this.logger.error(`Error deleting course: ${errorMessage}`);
      throw new InternalServerErrorException('Error deleting course');
    }
  }
}
