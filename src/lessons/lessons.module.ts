import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancesModule } from 'src/attendances/attendances.module';
import { CourseClassesModule } from 'src/course-classes/course-classes.module';

import { Lesson } from './entities/lesson.entity';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson]),
    forwardRef(() => CourseClassesModule),
    forwardRef(() => AttendancesModule),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
