import { ApiProperty } from '@nestjs/swagger';

import { Course } from '../entities/course.entity';

export class CourseResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Programming 101' })
  name: string;

  @ApiProperty({
    example: 3,
    description:
      'Number of active classes (EM_FORMACAO and EM_ANDAMENTO status)',
    required: false,
  })
  activeClassesCount?: number;

  constructor(course: Course & { activeClassesCount?: number }) {
    this.id = course.id;
    this.name = course.name;
    this.activeClassesCount = course.activeClassesCount;
  }
}
