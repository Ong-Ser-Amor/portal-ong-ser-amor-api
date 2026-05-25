import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Endereco } from 'src/enderecos/entities/endereco.entity';
import { Familia } from 'src/familias/entities/familia.entity';
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';

import { LimpezaFamiliasOrfaosTask } from './limpeza-familias-orfaos.task';
import { LimpezaPessoasOrfaosTask } from './limpeza-pessoas-orfaos.task';

@Module({
  imports: [TypeOrmModule.forFeature([Endereco, Familia, Pessoa])],
  providers: [LimpezaFamiliasOrfaosTask, LimpezaPessoasOrfaosTask],
})
export class TasksModule {}
