import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContatosModule } from 'src/contatos/contatos.module';
import { PessoasModule } from 'src/pessoas/pessoas.module';

import { BeneficiariosController } from './beneficiarios.controller';
import { BeneficiariosService } from './beneficiarios.service';
import { Beneficiario } from './entities/beneficiario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Beneficiario]),
    forwardRef(() => PessoasModule),
    ContatosModule,
  ],
  controllers: [BeneficiariosController],
  providers: [BeneficiariosService],
  exports: [BeneficiariosService],
})
export class BeneficiariosModule {}
