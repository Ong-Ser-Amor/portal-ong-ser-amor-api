import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurmasModule } from 'src/turmas/turmas.module';

import { AulasController } from './aulas.controller';
import { AulasService } from './aulas.service';
import { Aula } from './entities/aula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Aula]), forwardRef(() => TurmasModule)],
  controllers: [AulasController],
  providers: [AulasService],
  exports: [AulasService],
})
export class AulasModule {}
