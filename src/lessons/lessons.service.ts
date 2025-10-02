import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseClassesService } from 'src/course-classes/course-classes.service';
import { EntityNotFoundError, Repository } from 'typeorm';

import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);

  constructor(
    @InjectRepository(Lesson)
    private readonly repository: Repository<Lesson>,
    private readonly courseClassesService: CourseClassesService,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const courseClass = await this.courseClassesService.findOne(
      createLessonDto.courseClassId,
    );

    try {
      const lesson = this.repository.create({
        ...createLessonDto,
        courseClass,
      });
      return await this.repository.save(lesson);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error creating lesson: ${errorMessage}`);
      throw new InternalServerErrorException('Error creating lesson');
    }
  }

  async findByCourseClassId(courseClassId: number): Promise<Lesson[]> {
    await this.courseClassesService.findOne(courseClassId);

    try {
      return await this.repository.find({
        where: { courseClass: { id: courseClassId } },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(
        `Error finding lessons by course class id: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'Error finding lessons by course class id',
      );
    }
  }

  async findOne(id: number): Promise<Lesson> {
    try {
      return await this.repository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Lesson not found');
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error finding lesson by id: ${errorMessage}`);
      throw new InternalServerErrorException('Error finding lesson by id');
    }
  }

  async update(id: number, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findOne(id);

    try {
      this.repository.merge(lesson, updateLessonDto);
      return await this.repository.save(lesson);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error updating lesson: ${errorMessage}`);
      throw new InternalServerErrorException('Error updating lesson');
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
      this.logger.error(`Error removing lesson: ${errorMessage}`);
      throw new InternalServerErrorException('Error removing lesson');
    }
  }
}
