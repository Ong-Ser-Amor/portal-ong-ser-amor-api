import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AulasModule } from 'src/aulas/aulas.module';
import { TurmasMatriculasModule } from 'src/turmas-matriculas/turmas-matriculas.module';

import { TurmaProfessor } from './entities/turma-professor';
import { Turma } from './entities/turma.entity';
import { TurmasController } from './turmas.controller';
import { TurmasService } from './turmas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Turma, TurmaProfessor]),
    forwardRef(() => AulasModule),
    forwardRef(() => TurmasMatriculasModule),
  ],
  controllers: [TurmasController],
  providers: [TurmasService],
  exports: [TurmasService],
})
export class TurmasModule {}
