import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurmasModule } from 'src/turmas/turmas.module';
import { TurmasMatriculasModule } from 'src/turmas-matriculas/turmas-matriculas.module';

import { TurmaAtividadeEntrega } from './entities/turma-atividade-entrega.entity';
import { TurmaAtividade } from './entities/turmas-atividade.entity';
import { TurmasAtividadesController } from './turmas-atividades.controller';
import { TurmasAtividadesService } from './turmas-atividades.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TurmaAtividade, TurmaAtividadeEntrega]),
    TurmasModule,
    TurmasMatriculasModule,
  ],
  controllers: [TurmasAtividadesController],
  providers: [TurmasAtividadesService],
})
export class TurmasAtividadesModule {}
