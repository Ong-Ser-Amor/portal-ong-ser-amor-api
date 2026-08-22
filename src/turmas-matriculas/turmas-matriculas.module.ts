import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AulasModule } from 'src/aulas/aulas.module';
import { BeneficiariosModule } from 'src/beneficiarios/beneficiarios.module';
import { TurmasModule } from 'src/turmas/turmas.module';
import { TurmaAtividadeEntrega } from 'src/turmas-atividades/entities/turma-atividade-entrega.entity';

import { TurmaMatricula } from './entities/turmas-matricula.entity';
import { TurmasMatriculasController } from './turmas-matriculas.controller';
import { TurmasMatriculasService } from './turmas-matriculas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TurmaMatricula, TurmaAtividadeEntrega]),
    BeneficiariosModule,
    forwardRef(() => TurmasModule),
    forwardRef(() => AulasModule),
  ],
  controllers: [TurmasMatriculasController],
  providers: [TurmasMatriculasService],
  exports: [TurmasMatriculasService],
})
export class TurmasMatriculasModule {}
