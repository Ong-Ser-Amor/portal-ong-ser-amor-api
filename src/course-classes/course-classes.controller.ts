import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/dtos/api-paginated-response.decorator';
import { PaginatedResponseDto } from 'src/dtos/paginated-response.dto';
import { LessonResponseDto } from 'src/lessons/dto/lesson-response.dto';
import { LessonsService } from 'src/lessons/lessons.service';
import { StudentResponseDto } from 'src/students/dto/student-response.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

import { CourseClassesService } from './course-classes.service';
import { AddStudentDto } from './dto/add-student.dto';
import { AddTeacherDto } from './dto/add-teacher.dto';
import { CourseClassResponseDto } from './dto/course-class-response.dto';
import { CreateCourseClassDto } from './dto/create-course-class.dto';
import { UpdateCourseClassDto } from './dto/update-course-class.dto';

@Controller('course-classes')
@ApiTags('Course Classes')
export class CourseClassesController {
  constructor(
    private readonly courseClassesService: CourseClassesService,
    private readonly lessonsService: LessonsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new course class',
    description:
      'Creates a new course class. Available status: EM_FORMACAO (default, enrollments open), EM_ANDAMENTO (classes started), FINALIZADA (completed), CANCELADA (cancelled)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The course class has been successfully created.',
    type: CourseClassResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(
    @Body() createCourseClassDto: CreateCourseClassDto,
  ): Promise<CourseClassResponseDto> {
    return new CourseClassResponseDto(
      await this.courseClassesService.create(createCourseClassDto),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course class by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The course class has been successfully retrieved.',
    type: CourseClassResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course class not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CourseClassResponseDto> {
    return new CourseClassResponseDto(
      await this.courseClassesService.findOne(id),
    );
  }

  @Get(':id/lessons')
  @ApiOperation({ summary: 'Get all lessons from a course class' })
  @ApiPaginatedResponse(LessonResponseDto)
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course class not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getLessons(
    @Param('id', ParseIntPipe) id: number,
    @Query('take', ParseIntPipe) take: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
  ): Promise<PaginatedResponseDto<LessonResponseDto>> {
    const lessons = await this.lessonsService.findByCourseClassId(
      id,
      take,
      page,
    );

    const lessonDtos = lessons.data.map(
      (lesson) => new LessonResponseDto(lesson),
    );

    return new PaginatedResponseDto<LessonResponseDto>(
      lessonDtos,
      lessons.meta.totalItems,
      lessons.meta.itemsPerPage,
      lessons.meta.currentPage,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a course class by ID',
    description:
      'Updates a course class. Available status: EM_FORMACAO (enrollments open), EM_ANDAMENTO (classes started), FINALIZADA (completed), CANCELADA (cancelled)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The course class has been successfully updated.',
    type: CourseClassResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course class not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseClassDto: UpdateCourseClassDto,
  ): Promise<CourseClassResponseDto> {
    return new CourseClassResponseDto(
      await this.courseClassesService.update(id, updateCourseClassDto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a course class by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The course class has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course class not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.courseClassesService.remove(id);
  }

  // --- Rotas de Gerenciamento de Professores ---

  @Post(':id/teachers')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add a teacher to a course class' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Teacher successfully added to the course class',
  })
  async addTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body() addTeacherDto: AddTeacherDto,
  ): Promise<void> {
    await this.courseClassesService.addTeacherToClass(
      id,
      addTeacherDto.teacherId,
    );
  }

  @Get(':id/teachers')
  @ApiOperation({ summary: 'Get all teachers from a course class' })
  @ApiResponse({ status: HttpStatus.OK, type: [UserResponseDto] })
  async getTeachers(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto[]> {
    const teachers = await this.courseClassesService.getTeachersFromClass(id);
    return teachers.map((teacher) => new UserResponseDto(teacher));
  }

  @Delete(':id/teachers/:teacherId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a teacher from a course class' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Teacher successfully removed from the course class',
  })
  async removeTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ): Promise<void> {
    await this.courseClassesService.removeTeacherFromClass(id, teacherId);
  }

  // --- Rotas de Gerenciamento de Alunos ---

  @Post(':id/students')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add a student to a course class' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Student successfully added to the course class',
  })
  async addStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() addStudentDto: AddStudentDto,
  ): Promise<void> {
    await this.courseClassesService.addStudentToClass(
      id,
      addStudentDto.studentId,
    );
  }

  @Get(':id/students')
  @ApiOperation({
    summary: 'Get all students from a course class',
    description: 'Returns all students without pagination (for attendance)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [StudentResponseDto] })
  async getAllStudents(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StudentResponseDto[]> {
    const students = await this.courseClassesService.getStudentsFromClass(id);
    return students.map((student) => new StudentResponseDto(student));
  }

  @Get(':id/students/paginated')
  @ApiOperation({
    summary: 'Get paginated students from a course class',
    description: 'Returns students with pagination (for listing)',
  })
  @ApiPaginatedResponse(StudentResponseDto)
  async getStudents(
    @Param('id', ParseIntPipe) id: number,
    @Query('take', ParseIntPipe) take: number,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<PaginatedResponseDto<StudentResponseDto>> {
    const result =
      await this.courseClassesService.getStudentsFromClassPaginated(
        id,
        take,
        page,
      );

    const studentDtos = result.data.map(
      (student) => new StudentResponseDto(student),
    );

    return new PaginatedResponseDto<StudentResponseDto>(
      studentDtos,
      result.meta.totalItems,
      result.meta.itemsPerPage,
      result.meta.currentPage,
    );
  }

  @Delete(':id/students/:studentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a student from a course class' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Student successfully removed from the course class',
  })
  async removeStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ): Promise<void> {
    await this.courseClassesService.removeStudentFromClass(id, studentId);
  }
}
