import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiariosModule } from 'src/beneficiarios/beneficiarios.module';
import { EnderecosModule } from 'src/enderecos/enderecos.module';

import { Familia } from './entities/familia.entity';
import { FamiliasService } from './familias.service';
import { FamiliasController } from './familias.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Familia]),
    forwardRef(() => BeneficiariosModule),
    EnderecosModule,
  ],
  providers: [FamiliasService],
  exports: [FamiliasService],
  controllers: [FamiliasController],
})
export class FamiliasModule {}
