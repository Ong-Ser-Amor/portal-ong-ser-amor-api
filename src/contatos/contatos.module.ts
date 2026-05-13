import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Contato } from './entities/contato.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contato])],
})
export class ContatosModule {}
