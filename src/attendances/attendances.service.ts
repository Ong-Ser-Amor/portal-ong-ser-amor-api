import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessonsService } from 'src/lessons/lessons.service';
import { StudentsService } from 'src/students/students.service';
import { EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';

import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from './entities/attendance.entity';

@Injectable()
export class AttendancesService {
  private readonly logger = new Logger(AttendancesService.name);

  constructor(
    @InjectRepository(Attendance)
    private readonly repository: Repository<Attendance>,
    private readonly studentsService: StudentsService,
    private readonly lessonsService: LessonsService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const student = await this.studentsService.findOne(
      createAttendanceDto.studentId,
    );
    const lesson = await this.lessonsService.findOne(
      createAttendanceDto.lessonId,
    );

    try {
      const attendance = this.repository.create({
        ...createAttendanceDto,
        student,
        lesson,
      });
      return await this.repository.save(attendance);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;

      // Tratar erro de violação de constraint UNIQUE (código 23505 no PostgreSQL)
      if (
        error instanceof QueryFailedError &&
        'code' in error &&
        error.code === '23505'
      ) {
        this.logger.warn(
          `Attempted to create duplicate attendance record for student ${createAttendanceDto.studentId} in lesson ${createAttendanceDto.lessonId}`,
        );
        throw new ConflictException(
          'Attendance record for this student in this lesson already exists.',
        );
      }

      this.logger.error(`Error creating attendance: ${errorMessage}`);
      throw new InternalServerErrorException('Error creating attendance');
    }
  }

  async findAllByLesson(lessonId: number): Promise<Attendance[]> {
    await this.lessonsService.findOne(lessonId);

    try {
      return await this.repository.find({
        where: { lesson: { id: lessonId } },
        relations: ['student'],
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(
        `Error finding attendances by lesson id: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'Error finding attendances by lesson id',
      );
    }
  }

  async findOne(id: number): Promise<Attendance> {
    try {
      return await this.repository.findOneOrFail({
        where: { id },
        relations: ['student', 'lesson'],
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          `Attendance record with ID ${id} not found.`,
        );
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error finding attendance record with ID ${id}: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'Error retrieving attendance record.',
      );
    }
  }

  async update(
    id: number,
    updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    const attendance = await this.findOne(id);

    try {
      this.repository.merge(attendance, updateAttendanceDto);
      return await this.repository.save(attendance);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error updating attendance by id: ${errorMessage}`);
      throw new InternalServerErrorException(
        'Error updating attendance record.',
      );
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    try {
      await this.repository.softDelete(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error removing attendance record with ID ${id}: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'Error removing attendance record.',
      );
    }
  }
}
