import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Endereco } from './entities/endereco.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Endereco])],
})
export class EnderecosModule {}
