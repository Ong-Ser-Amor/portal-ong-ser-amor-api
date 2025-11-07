import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseClassesModule } from 'src/course-classes/course-classes.module';
import { LessonsModule } from 'src/lessons/lessons.module';
import { StudentsModule } from 'src/students/students.module';

import { AttendancesService } from './attendances.service';
import { Attendance } from './entities/attendance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    StudentsModule,
    forwardRef(() => CourseClassesModule),
    forwardRef(() => LessonsModule),
  ],
  providers: [AttendancesService],
  exports: [AttendancesService],
})
export class AttendancesModule {}
