import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Voluntario } from './entities/voluntario.entity';
import { VoluntariosController } from './voluntarios.controller';
import { VoluntariosService } from './voluntarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Voluntario])],
  controllers: [VoluntariosController],
  providers: [VoluntariosService],
  exports: [VoluntariosService],
})
export class VoluntariosModule {}
