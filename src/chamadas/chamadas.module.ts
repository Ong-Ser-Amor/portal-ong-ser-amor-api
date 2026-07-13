import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AulasModule } from 'src/aulas/aulas.module';
import { TurmasMatriculasModule } from 'src/turmas-matriculas/turmas-matriculas.module';

import { ChamadasController } from './chamadas.controller';
import { ChamadasService } from './chamadas.service';
import { Chamada } from './entities/chamada.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chamada]),
    forwardRef(() => AulasModule),
    forwardRef(() => TurmasMatriculasModule),
  ],
  controllers: [ChamadasController],
  providers: [ChamadasService],
})
export class ChamadasModule {}
