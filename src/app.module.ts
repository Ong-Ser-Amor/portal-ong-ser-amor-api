import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AreasModule } from './areas/areas.module';
import { AssetCategoriesModule } from './asset-categories/asset-categories.module';
import { AttendancesModule } from './attendances/attendances.module';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { BeneficiariosModule } from './beneficiarios/beneficiarios.module';
import { ContatosModule } from './contatos/contatos.module';
import { CourseClassesModule } from './course-classes/course-classes.module';
import { CoursesModule } from './courses/courses.module';
import { EnderecosModule } from './enderecos/enderecos.module';
import { FamiliasModule } from './familias/familias.module';
import { LessonsModule } from './lessons/lessons.module';
import { LocationsModule } from './locations/locations.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { StudentsModule } from './students/students.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VoluntariosModule } from './voluntarios/voluntarios.module';
import { CursosModule } from './cursos/cursos.module';
import { PlanosCursoModule } from './planos-curso/planos-curso.module';
import { TurmasModule } from './turmas/turmas.module';
import { TurmasMatriculasModule } from './turmas-matriculas/turmas-matriculas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: false,
        migrations: [__dirname + '/migracoes/**/*{.ts,.js}'],
        migrationsRun: true,
        ssl:
          configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AreasModule,
    AssetCategoriesModule,
    AttendancesModule,
    BeneficiariosModule,
    ContatosModule,
    CoursesModule,
    CourseClassesModule,
    EnderecosModule,
    FamiliasModule,
    LessonsModule,
    LocationsModule,
    PessoasModule,
    StudentsModule,
    TasksModule,
    UsersModule,
    UsuariosModule,
    VoluntariosModule,
    AutenticacaoModule,
    CursosModule,
    PlanosCursoModule,
    TurmasModule,
    TurmasMatriculasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
