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
import { CourseClassesService } from 'src/course-classes/course-classes.service';
import { CourseClassResponseDto } from 'src/course-classes/dto/course-class-response.dto';
import { ApiPaginatedResponse } from 'src/dtos/api-paginated-response.decorator';
import { PaginatedResponseDto } from 'src/dtos/paginated-response.dto';

import { CoursesService } from './courses.service';
import { CourseResponseDto } from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
@ApiTags('Courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly courseClassesService: CourseClassesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The course has been successfully created',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<CourseResponseDto> {
    return new CourseResponseDto(
      await this.coursesService.create(createCourseDto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiPaginatedResponse(CourseResponseDto)
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findAll(
    @Query('take', ParseIntPipe) take: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
  ): Promise<PaginatedResponseDto<CourseResponseDto>> {
    const courses = await this.coursesService.findAll(take, page);

    const courseDtos = courses.data.map(
      (course) => new CourseResponseDto(course),
    );

    return new PaginatedResponseDto<CourseResponseDto>(
      courseDtos,
      courses.meta.totalItems,
      courses.meta.itemsPerPage,
      courses.meta.currentPage,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The course has been successfully retrieved',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CourseResponseDto> {
    return new CourseResponseDto(await this.coursesService.findOne(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The course has been successfully updated',
    type: CourseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CourseResponseDto> {
    return new CourseResponseDto(
      await this.coursesService.update(id, updateCourseDto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a course by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The course has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coursesService.remove(id);
  }

  @Get(':id/classes')
  @ApiOperation({ summary: 'Get all course classes from a course' })
  @ApiPaginatedResponse(CourseClassResponseDto)
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Course not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findCourseClasses(
    @Param('id', ParseIntPipe) id: number,
    @Query('take', ParseIntPipe) take: number = 10,
    @Query('page', ParseIntPipe) page: number = 1,
  ): Promise<PaginatedResponseDto<CourseClassResponseDto>> {
    const courseClasses = await this.courseClassesService.findAllByCourseId(
      id,
      take,
      page,
    );

    const courseClassDtos = courseClasses.data.map(
      (courseClass) => new CourseClassResponseDto(courseClass),
    );

    return new PaginatedResponseDto<CourseClassResponseDto>(
      courseClassDtos,
      courseClasses.meta.totalItems,
      courseClasses.meta.itemsPerPage,
      courseClasses.meta.currentPage,
    );
  }
}
