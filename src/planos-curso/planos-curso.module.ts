import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlanosCurso } from './entities/planos-curso.entity';
import { PlanosCursoController } from './planos-curso.controller';
import { PlanosCursoService } from './planos-curso.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlanosCurso])],
  controllers: [PlanosCursoController],
  providers: [PlanosCursoService],
  exports: [PlanosCursoService],
})
export class PlanosCursoModule {}
