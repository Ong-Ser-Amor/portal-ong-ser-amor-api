import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnderecosController } from './enderecos.controller';
import { EnderecosService } from './enderecos.service';
import { Endereco } from './entities/endereco.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Endereco])],
  providers: [EnderecosService],
  exports: [EnderecosService],
  controllers: [EnderecosController],
})
export class EnderecosModule {}
