import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PessoaContato } from 'src/pessoas/entities/pessoa-contato.entity';
import { PessoasModule } from 'src/pessoas/pessoas.module';

import { ContatosService } from './contatos.service';
import { Contato } from './entities/contato.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contato, PessoaContato]),
    forwardRef(() => PessoasModule),
  ],
  providers: [ContatosService],
  exports: [ContatosService],
})
export class ContatosModule {}
