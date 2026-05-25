import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiariosModule } from 'src/beneficiarios/beneficiarios.module';

import { Familia } from './entities/familia.entity';
import { FamiliasService } from './familias.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Familia]),
    forwardRef(() => BeneficiariosModule),
  ],
  providers: [FamiliasService],
  exports: [FamiliasService],
})
export class FamiliasModule {}
