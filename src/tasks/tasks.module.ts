import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';

import { LimpezaOrfaosTask } from './limpeza-orfaos.task';

@Module({
  imports: [TypeOrmModule.forFeature([Pessoa])],
  providers: [LimpezaOrfaosTask],
})
export class TasksModule {}
