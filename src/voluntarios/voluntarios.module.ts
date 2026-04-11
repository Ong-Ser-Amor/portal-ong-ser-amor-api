import { Module } from '@nestjs/common';
import { VoluntariosService } from './voluntarios.service';
import { VoluntariosController } from './voluntarios.controller';

@Module({
  controllers: [VoluntariosController],
  providers: [VoluntariosService],
})
export class VoluntariosModule {}
