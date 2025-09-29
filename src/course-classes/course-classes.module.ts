import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from 'src/courses/courses.module';
import { StudentsModule } from 'src/students/students.module';
import { UsersModule } from 'src/users/users.module';

import { CourseClassesController } from './course-classes.controller';
import { CourseClassesService } from './course-classes.service';
import { CourseClass } from './entities/course-class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseClass]),
    CoursesModule,
    UsersModule,
    StudentsModule,
  ],
  controllers: [CourseClassesController],
  providers: [CourseClassesService],
  exports: [CourseClassesService],
})
export class CourseClassesModule {}
