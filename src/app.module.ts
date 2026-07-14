import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AulasModule } from './aulas/aulas.module';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { BeneficiariosModule } from './beneficiarios/beneficiarios.module';
import { ChamadasModule } from './chamadas/chamadas.module';
import { ContatosModule } from './contatos/contatos.module';
import { CursosModule } from './cursos/cursos.module';
import { EnderecosModule } from './enderecos/enderecos.module';
import { FamiliasModule } from './familias/familias.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { PlanosCursoModule } from './planos-curso/planos-curso.module';
import { TasksModule } from './tasks/tasks.module';
import { TurmasModule } from './turmas/turmas.module';
import { TurmasMatriculasModule } from './turmas-matriculas/turmas-matriculas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VoluntariosModule } from './voluntarios/voluntarios.module';

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
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: true,
        ssl:
          configService.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    BeneficiariosModule,
    ContatosModule,
    EnderecosModule,
    FamiliasModule,
    PessoasModule,
    TasksModule,
    UsuariosModule,
    VoluntariosModule,
    AutenticacaoModule,
    CursosModule,
    PlanosCursoModule,
    TurmasModule,
    TurmasMatriculasModule,
    AulasModule,
    ChamadasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
