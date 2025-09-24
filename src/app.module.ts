import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { CourseClassesModule } from './course-classes/course-classes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(
          'DATABASE_HOST',
          process.env.DATABASE_HOST,
        ),
        port: parseInt(
          configService.get<string>('DATABASE_PORT', process.env.DATABASE_PORT),
          10,
        ),
        username: configService.get<string>(
          'DATABASE_USER',
          process.env.DATABASE_USER,
        ),
        password: configService.get<string>(
          'DATABASE_PASSWORD',
          process.env.DATABASE_PASSWORD,
        ),
        database: configService.get<string>(
          'DATABASE_NAME',
          process.env.DATABASE_NAME,
        ),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: false,
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    StudentsModule,
    CoursesModule,
    CourseClassesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
