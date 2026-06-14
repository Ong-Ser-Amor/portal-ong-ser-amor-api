import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanoCurso } from './entities/plano-curso.entity';
import { PlanosCursoController } from './planos-curso.controller';
import { PlanosCursoService } from './planos-curso.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlanoCurso])],
  controllers: [PlanosCursoController],
  providers: [PlanosCursoService],
  exports: [PlanosCursoService],
})
export class PlanosCursoModule {}
