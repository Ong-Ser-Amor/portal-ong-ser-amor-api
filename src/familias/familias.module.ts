import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Familia } from './entities/familia.entity';
import { FamiliasService } from './familias.service';

@Module({
  imports: [TypeOrmModule.forFeature([Familia])],
  providers: [FamiliasService],
  exports: [FamiliasService],
})
export class FamiliasModule {}
