import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiariosModule } from 'src/beneficiarios/beneficiarios.module';
import { TurmasModule } from 'src/turmas/turmas.module';

import { TurmaMatricula } from './entities/turmas-matricula.entity';
import { TurmasMatriculasController } from './turmas-matriculas.controller';
import { TurmasMatriculasService } from './turmas-matriculas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TurmaMatricula]),
    BeneficiariosModule,
    TurmasModule,
  ],
  controllers: [TurmasMatriculasController],
  providers: [TurmasMatriculasService],
  exports: [TurmasMatriculasService],
})
export class TurmasMatriculasModule {}
