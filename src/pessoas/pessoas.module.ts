import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeneficiariosModule } from 'src/beneficiarios/beneficiarios.module';
import { Voluntario } from 'src/voluntarios/entities/voluntario.entity';
import { VoluntariosModule } from 'src/voluntarios/voluntarios.module';

import { Pessoa } from './entities/pessoa.entity';
import { PessoasController } from './pessoas.controller';
import { PessoasService } from './pessoas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pessoa, Voluntario]),
    forwardRef(() => VoluntariosModule),
    forwardRef(() => BeneficiariosModule),
  ],
  controllers: [PessoasController],
  providers: [PessoasService],
  exports: [PessoasService],
})
export class PessoasModule {}
