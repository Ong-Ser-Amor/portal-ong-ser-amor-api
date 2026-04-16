import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Pessoa } from './entities/pessoa.entity';
import { PessoasService } from './pessoas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pessoa])],
  providers: [PessoasService],
  exports: [PessoasService],
})
export class PessoasModule {}
