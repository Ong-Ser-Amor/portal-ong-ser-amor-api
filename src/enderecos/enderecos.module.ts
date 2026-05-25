import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnderecosService } from './enderecos.service';
import { Endereco } from './entities/endereco.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Endereco])],
  providers: [EnderecosService],
  exports: [EnderecosService],
})
export class EnderecosModule {}
