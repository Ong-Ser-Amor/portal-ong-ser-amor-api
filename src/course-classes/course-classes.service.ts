import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoursesService } from 'src/courses/courses.service';
import { PaginatedResponseDto } from 'src/dtos/paginated-response.dto';
import { Student } from 'src/students/entities/student.entity';
import { StudentsService } from 'src/students/students.service';
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
    private readonly studentsService: StudentsService,
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

  async findAll(
    take = 10,
    page = 1,
  ): Promise<PaginatedResponseDto<CourseClass>> {
    try {
      const skip = (page - 1) * take;

      const queryBuilder = this.repository
        .createQueryBuilder('courseClass')
        .leftJoinAndSelect('courseClass.course', 'course')
        .loadRelationCountAndMap(
          'courseClass.studentsCount',
          'courseClass.students',
        )
        .orderBy('courseClass.createdAt', 'DESC')
        .take(take)
        .skip(skip);

      const [courseClasses, total] = await queryBuilder.getManyAndCount();

      return new PaginatedResponseDto(courseClasses, total, take, page);
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
        relations: ['course'],
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

  // --- Métodos Privados para Buscar Relações ---

  private async findOneWithTeachers(classId: number): Promise<CourseClass> {
    const courseClass = await this.repository.findOne({
      where: { id: classId },
      relations: ['teachers'],
    });

    if (!courseClass) {
      throw new NotFoundException('Course class not found');
    }

    return courseClass;
  }

  private async findOneWithStudents(classId: number): Promise<CourseClass> {
    const courseClass = await this.repository.findOne({
      where: { id: classId },
      relations: ['students'],
    });

    if (!courseClass) {
      throw new NotFoundException('Course class not found');
    }

    return courseClass;
  }

  // --- Métodos de Gerenciamento de Professores ---

  async addTeacherToClass(classId: number, teacherId: number): Promise<void> {
    const courseClass = await this.findOneWithTeachers(classId);

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
      await this.repository.save(courseClass);
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
  ): Promise<void> {
    const courseClass = await this.findOneWithTeachers(classId);

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
      await this.repository.save(courseClass);
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
    const courseClass = await this.findOneWithTeachers(classId);
    return courseClass.teachers;
  }

  // --- Métodos de Gerenciamento de Alunos ---

  async addStudentToClass(classId: number, studentId: number): Promise<void> {
    const courseClass = await this.findOneWithStudents(classId);

    const student = await this.studentsService.findOne(studentId);

    if (!courseClass.students) {
      courseClass.students = [];
    }

    const isStudentAlreadyInClass = courseClass.students.some(
      (s) => s.id === studentId,
    );

    if (isStudentAlreadyInClass) {
      throw new BadRequestException(
        `Student with ID ${studentId} is already in this class.`,
      );
    }

    courseClass.students.push(student);

    try {
      await this.repository.save(courseClass);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error adding student to class: ${errorMessage}`);
      throw new InternalServerErrorException('Error adding student to class');
    }
  }

  async removeStudentFromClass(
    classId: number,
    studentId: number,
  ): Promise<void> {
    const courseClass = await this.findOneWithStudents(classId);

    const initialStudentCount = courseClass.students.length;
    courseClass.students = courseClass.students.filter(
      (student) => student.id !== studentId,
    );

    if (courseClass.students.length === initialStudentCount) {
      throw new NotFoundException(
        `Student with ID ${studentId} not found in this class.`,
      );
    }

    try {
      await this.repository.save(courseClass);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error removing student from class: ${errorMessage}`);
      throw new InternalServerErrorException(
        'Error removing student from class',
      );
    }
  }

  async getStudentsFromClass(classId: number): Promise<Student[]> {
    const courseClass = await this.findOneWithStudents(classId);
    return courseClass.students;
  }
}
