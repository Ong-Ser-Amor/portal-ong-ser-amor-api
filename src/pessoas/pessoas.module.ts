import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voluntario } from 'src/voluntarios/entities/voluntario.entity';

import { Pessoa } from './entities/pessoa.entity';
import { PessoasController } from './pessoas.controller';
import { PessoasService } from './pessoas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pessoa, Voluntario])],
  controllers: [PessoasController],
  providers: [PessoasService],
  exports: [PessoasService],
})
export class PessoasModule {}
