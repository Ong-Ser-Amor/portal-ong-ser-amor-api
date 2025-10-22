import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AttendancesService } from './attendances.service';
import { AttendanceResponseDto } from './dto/attendance-response.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@ApiTags('Attendances')
@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attendance record' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The attendance record has been successfully created.',
    type: AttendanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Attendance record for this student/lesson already exists.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Student or Lesson not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error.',
  })
  async create(
    @Body() createAttendanceDto: CreateAttendanceDto,
  ): Promise<AttendanceResponseDto> {
    const attendance =
      await this.attendancesService.create(createAttendanceDto);
    return new AttendanceResponseDto(attendance);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single attendance record by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attendance record retrieved successfully.',
    type: AttendanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attendance record not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error.',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AttendanceResponseDto> {
    const attendance = await this.attendancesService.findOne(id);
    return new AttendanceResponseDto(attendance);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance record' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attendance record updated successfully.',
    type: AttendanceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attendance record not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<AttendanceResponseDto> {
    const updatedAttendance = await this.attendancesService.update(
      id,
      updateAttendanceDto,
    );
    return new AttendanceResponseDto(updatedAttendance);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an attendance record' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Attendance record deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attendance record not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error.',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.attendancesService.remove(id);
  }
}
