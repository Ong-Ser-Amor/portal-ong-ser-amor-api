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

import { CourseClassesService } from './course-classes.service';
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
}
