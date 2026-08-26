import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { Perfis } from 'src/shared/decorators/perfis.decorator';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

import { ContatosService } from './contatos.service';
import {
  ApiDocAtualizarContato,
  ApiDocBuscarContatosPorPessoaId,
  ApiDocCriarContato,
  ApiDocRemoverContato,
} from './contatos.swagger';
import { AtualizarContatoDto } from './dto/atualizar-contato.dto';
import { ContatoDto } from './dto/contato.dto';
import { CriarContatoDto } from './dto/criar-contato.dto';

@ApiTags('Contatos')
@ApiForbiddenResponse({
  description: 'Acesso não autorizado para o perfil do usuário (requer ADMIN).',
})
@Perfis(PerfilAcesso.ADMIN)
@Controller('contatos')
export class ContatosController {
  constructor(private readonly contatosService: ContatosService) {}

  @Post()
  @ApiDocCriarContato()
  async criar(@Body() criarContatoDto: CriarContatoDto): Promise<ContatoDto> {
    const contatoCriado = await this.contatosService.criar(criarContatoDto);
    return new ContatoDto(contatoCriado);
  }

  @Get('pessoa/:pessoaId')
  @ApiDocBuscarContatosPorPessoaId()
  async buscarPorPessoaId(
    @Param('pessoaId') pessoaId: string,
  ): Promise<ContatoDto[]> {
    const contatos = await this.contatosService.buscarPorPessoaId(pessoaId);
    return contatos.map((contato) => new ContatoDto(contato));
  }

  @Patch(':id')
  @ApiDocAtualizarContato()
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarContatoDto: AtualizarContatoDto,
  ): Promise<ContatoDto> {
    const contatoAtualizado = await this.contatosService.atualizar(
      id,
      atualizarContatoDto,
    );
    return new ContatoDto(contatoAtualizado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDocRemoverContato()
  async remover(@Param('id') id: string): Promise<void> {
    await this.contatosService.remover(id);
  }
}
