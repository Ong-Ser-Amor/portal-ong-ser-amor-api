import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursesService } from 'src/courses/courses.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { EntityNotFoundError, Repository } from 'typeorm';

import { CreateCourseClassDto } from './dto/create-course-class.dto';
import { UpdateCourseClassDto } from './dto/update-course-class.dto';
import { CourseClass } from './entities/course-class.entity';

@Injectable()
export class CourseClassesService {
  private readonly logger = new Logger(CourseClassesService.name);

  constructor(
    @InjectRepository(CourseClass)
    private readonly repository: Repository<CourseClass>,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createCourseClassDto: CreateCourseClassDto,
  ): Promise<CourseClass> {
    const course = await this.coursesService.findOne(
      createCourseClassDto.courseId,
    );

    try {
      const courseClass = this.repository.create({
        ...createCourseClassDto,
        course,
      });
      return await this.repository.save(courseClass);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error creating course class: ${errorMessage}`);
      throw new InternalServerErrorException('Error creating course class');
    }
  }

  async findAll(): Promise<CourseClass[]> {
    try {
      return await this.repository.find({ relations: ['course'] });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error finding all course classes: ${errorMessage}`);
      throw new InternalServerErrorException(
        'Error finding all course classes',
      );
    }
  }

  async findOne(id: number): Promise<CourseClass> {
    try {
      return await this.repository.findOneOrFail({
        where: { id },
        relations: ['course', 'teachers'],
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Course class not found');
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error finding course class: ${errorMessage}`);
      throw new InternalServerErrorException('Error finding course class');
    }
  }

  async update(
    id: number,
    updateCourseClassDto: UpdateCourseClassDto,
  ): Promise<CourseClass> {
    const courseClass = await this.findOne(id);

    try {
      this.repository.merge(courseClass, updateCourseClassDto);
      return await this.repository.save(courseClass);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error updating course class: ${errorMessage}`);
      throw new InternalServerErrorException('Error updating course class');
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
      this.logger.error(`Error deleting course class: ${errorMessage}`);
      throw new InternalServerErrorException('Error deleting course class');
    }
  }

  // --- Métodos de Gerenciamento de Professores ---

  async addTeacherToClass(
    classId: number,
    teacherId: number,
  ): Promise<CourseClass> {
    const courseClass = await this.findOne(classId);
    const teacher = await this.usersService.findOne(teacherId);

    const isTeacherAlreadyInClass = courseClass.teachers.some(
      (t) => t.id === teacherId,
    );

    if (isTeacherAlreadyInClass) {
      throw new BadRequestException(
        `Teacher with ID ${teacherId} is already in this class.`,
      );
    }

    courseClass.teachers.push(teacher);

    try {
      return await this.repository.save(courseClass);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error adding teacher to class: ${errorMessage}`);
      throw new InternalServerErrorException('Error adding teacher to class');
    }
  }

  async removeTeacherFromClass(
    classId: number,
    teacherId: number,
  ): Promise<CourseClass> {
    const courseClass = await this.findOne(classId);

    const initialTeacherCount = courseClass.teachers.length;
    courseClass.teachers = courseClass.teachers.filter(
      (teacher) => teacher.id !== teacherId,
    );

    if (courseClass.teachers.length === initialTeacherCount) {
      throw new NotFoundException(
        `Teacher with ID ${teacherId} not found in this class.`,
      );
    }

    try {
      return await this.repository.save(courseClass);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error removing teacher from class: ${errorMessage}`);
      throw new InternalServerErrorException(
        'Error removing teacher from class',
      );
    }
  }

  async getTeachersFromClass(classId: number): Promise<User[]> {
    const courseClass = await this.findOne(classId);
    return courseClass.teachers;
  }
}
