import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PessoasModule } from 'src/pessoas/pessoas.module';

import { Voluntario } from './entities/voluntario.entity';
import { VoluntariosController } from './voluntarios.controller';
import { VoluntariosService } from './voluntarios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voluntario]),
    forwardRef(() => PessoasModule),
  ],
  controllers: [VoluntariosController],
  providers: [VoluntariosService],
  exports: [VoluntariosService],
})
export class VoluntariosModule {}
