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
import { PaginatedResponseDto } from 'src/dtos/paginated-response.dto';

import { CreateStudentDto } from './dto/create-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@Controller('students')
@ApiTags('Students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The student has been successfully created',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<StudentResponseDto> {
    return new StudentResponseDto(
      await this.studentsService.create(createStudentDto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The students have been successfully retrieved',
    type: [StudentResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findAll(
    @Query('take', ParseIntPipe) take: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
  ): Promise<PaginatedResponseDto<StudentResponseDto>> {
    const students = await this.studentsService.findAll(take, page);

    const studentDtos = students.data.map(
      (student) => new StudentResponseDto(student),
    );

    return new PaginatedResponseDto<StudentResponseDto>(
      studentDtos,
      students.meta.totalItems,
      students.meta.itemsPerPage,
      students.meta.currentPage,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The student has been successfully retrieved',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StudentResponseDto> {
    return new StudentResponseDto(await this.studentsService.findOne(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The student has been successfully updated',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<StudentResponseDto> {
    return new StudentResponseDto(
      await this.studentsService.update(id, updateStudentDto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete student by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The student has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.studentsService.remove(id);
  }
}
