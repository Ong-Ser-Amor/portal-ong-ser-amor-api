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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  constructor(private readonly courseClassesService: CourseClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course class' })
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

  @Get()
  @ApiOperation({ summary: 'Get all course classes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The course classes have been successfully retrieved.',
    type: [CourseClassResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findAll(): Promise<CourseClassResponseDto[]> {
    const courseClasses = await this.courseClassesService.findAll();
    return courseClasses.map(
      (courseClass) => new CourseClassResponseDto(courseClass),
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

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course class by ID' })
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
  @ApiOperation({ summary: 'Add a teacher to a course class' })
  @ApiResponse({ status: HttpStatus.OK, type: CourseClassResponseDto })
  async addTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body() addTeacherDto: AddTeacherDto,
  ): Promise<CourseClassResponseDto> {
    const updatedCourseClass =
      await this.courseClassesService.addTeacherToClass(
        id,
        addTeacherDto.teacherId,
      );
    return new CourseClassResponseDto(updatedCourseClass);
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
  @ApiOperation({ summary: 'Remove a teacher from a course class' })
  @ApiResponse({ status: HttpStatus.OK, type: CourseClassResponseDto })
  async removeTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ): Promise<CourseClassResponseDto> {
    const updatedCourseClass =
      await this.courseClassesService.removeTeacherFromClass(id, teacherId);
    return new CourseClassResponseDto(updatedCourseClass);
  }

  // --- Rotas de Gerenciamento de Alunos ---

  @Post(':id/students')
  @ApiOperation({ summary: 'Add a student to a course class' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CourseClassResponseDto })
  async addStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() addStudentDto: AddStudentDto,
  ): Promise<CourseClassResponseDto> {
    const updatedCourseClass =
      await this.courseClassesService.addStudentToClass(
        id,
        addStudentDto.studentId,
      );
    return new CourseClassResponseDto(updatedCourseClass);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Get all students from a course class' })
  @ApiResponse({ status: HttpStatus.OK, type: [StudentResponseDto] })
  async getStudents(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StudentResponseDto[]> {
    const students = await this.courseClassesService.getStudentsFromClass(id);
    return students.map((student) => new StudentResponseDto(student));
  }

  @Delete(':id/students/:studentId')
  @ApiOperation({ summary: 'Remove a student from a course class' })
  @ApiResponse({ status: HttpStatus.OK, type: CourseClassResponseDto })
  async removeStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ): Promise<CourseClassResponseDto> {
    const updatedCourseClass =
      await this.courseClassesService.removeStudentFromClass(id, studentId);
    return new CourseClassResponseDto(updatedCourseClass);
  }
}
