import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddressesModule } from './addresses/addresses.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AreasModule } from './areas/areas.module';
import { AssetCategoriesModule } from './asset-categories/asset-categories.module';
import { AttendancesModule } from './attendances/attendances.module';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { CourseClassesModule } from './course-classes/course-classes.module';
import { CoursesModule } from './courses/courses.module';
import { FamiliesModule } from './families/families.module';
import { LessonsModule } from './lessons/lessons.module';
import { LocationsModule } from './locations/locations.module';
import { PeopleModule } from './people/people.module';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { EnderecosModule } from './enderecos/enderecos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ContatosModule } from './contatos/contatos.module';

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
    UsersModule,
    AuthModule,
    StudentsModule,
    CoursesModule,
    CourseClassesModule,
    LessonsModule,
    AttendancesModule,
    LocationsModule,
    AreasModule,
    AssetCategoriesModule,
    PeopleModule,
    VolunteersModule,
    ContactsModule,
    AddressesModule,
    FamiliesModule,
    PessoasModule,
    EnderecosModule,
    UsuariosModule,
    ContatosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
