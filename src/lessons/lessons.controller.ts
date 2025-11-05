import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AttendancesService } from 'src/attendances/attendances.service';
import { AttendanceResponseDto } from 'src/attendances/dto/attendance-response.dto';
import { BulkAttendanceDto } from 'src/attendances/dto/bulk-attendance.dto';

import { CreateLessonDto } from './dto/create-lesson.dto';
import { LessonResponseDto } from './dto/lesson-response.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonsService } from './lessons.service';

@Controller('lessons')
@ApiTags('Lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly attendancesService: AttendancesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The lesson has been successfully created.',
    type: CreateLessonDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<LessonResponseDto> {
    return new LessonResponseDto(
      await this.lessonsService.create(createLessonDto),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lesson by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The lesson has been successfully retrieved.',
    type: LessonResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lesson not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LessonResponseDto> {
    return new LessonResponseDto(await this.lessonsService.findOne(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lesson by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The lesson has been successfully updated.',
    type: LessonResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lesson not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<LessonResponseDto> {
    return new LessonResponseDto(
      await this.lessonsService.update(id, updateLessonDto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lesson by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The lesson has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lesson not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.lessonsService.remove(id);
  }

  @Post(':id/attendances')
  @ApiOperation({
    summary: 'Create or update attendance records for a lesson',
    description:
      'Creates or updates attendance records for all students in a course class. All students must be included in the request.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Attendance records have been successfully created/updated.',
    type: [AttendanceResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Missing students or invalid student IDs for this course class.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lesson not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async bulkUpsertAttendances(
    @Param('id', ParseIntPipe) id: number,
    @Body() bulkAttendanceDto: BulkAttendanceDto,
  ): Promise<AttendanceResponseDto[]> {
    const attendances = await this.attendancesService.bulkUpsert(
      id,
      bulkAttendanceDto.attendances,
    );
    return attendances.map((att) => new AttendanceResponseDto(att));
  }

  @Get(':id/attendances')
  @ApiOperation({ summary: 'Get all attendance records for a specific lesson' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attendance records retrieved successfully.',
    type: [AttendanceResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lesson not found.',
  })
  async findAllAttendancesByLesson(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AttendanceResponseDto[]> {
    const attendances = await this.attendancesService.findAllByLesson(id);
    return attendances.map((att) => new AttendanceResponseDto(att));
  }

  @Delete(':id/attendances')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete all attendance records for a lesson',
    description:
      'Removes all attendance records for a specific lesson. Useful for clearing attendance data entered by mistake.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'All attendance records have been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lesson not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async removeAllAttendances(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.attendancesService.removeAllByLesson(id);
  }
}
