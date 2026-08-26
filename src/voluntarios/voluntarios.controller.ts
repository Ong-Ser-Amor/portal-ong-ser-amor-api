import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { PessoaDto } from 'src/pessoas/dto/pessoa.dto';
import { Perfis } from 'src/shared/decorators/perfis.decorator';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { ValidarCpfPipe } from 'src/shared/pipes/validar-cpf.pipe';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

import { AtualizarVoluntarioDto } from './dto/atualizar-voluntario.dto';
import { CriarVoluntarioDto } from './dto/criar-voluntario.dto';
import { VoluntarioResumoDto } from './dto/voluntario-resumo.dto';
import { VoluntarioDto } from './dto/voluntario.dto';
import { VoluntariosService } from './voluntarios.service';
import {
  ApiDocAtualizarVoluntario,
  ApiDocBuscarVoluntarioPorId,
  ApiDocBuscarVoluntarios,
  ApiDocCriarVoluntario,
  ApiDocRemoverVoluntario,
  ApiDocVerificarCadastroPorCpf,
} from './voluntarios.swagger';

@ApiTags('Voluntarios')
@ApiForbiddenResponse({
  description:
    'Acesso não autorizado para o perfil do usuário (requer ADMINISTRADOR).',
})
@Perfis(PerfilAcesso.ADMINISTRADOR)
@Controller('voluntarios')
export class VoluntariosController {
  constructor(private readonly voluntariosService: VoluntariosService) {}

  @Post()
  @ApiDocCriarVoluntario()
  async criar(
    @Body() criarVoluntarioDto: CriarVoluntarioDto,
  ): Promise<VoluntarioDto> {
    const voluntarioCriado =
      await this.voluntariosService.criar(criarVoluntarioDto);
    return new VoluntarioDto(voluntarioCriado);
  }

  @Get('verificar-cadastro/cpf/:cpf')
  @ApiDocVerificarCadastroPorCpf()
  async verificarCadastroPorCpf(
    @Param('cpf', ValidarCpfPipe) cpf: string,
  ): Promise<PessoaDto> {
    const pessoa = await this.voluntariosService.verificarCadastroPorCpf(cpf);
    return new PessoaDto(pessoa);
  }

  @Get()
  @ApiDocBuscarVoluntarios()
  async buscarTodos(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('itensPorPagina', new DefaultValuePipe(10), ParseIntPipe)
    itensPorPagina: number,
    @Query('nome') nome?: string,
  ): Promise<PaginacaoRespostaDto<VoluntarioResumoDto>> {
    const voluntariosPaginados = await this.voluntariosService.buscarTodos(
      pagina,
      itensPorPagina,
      nome,
    );

    const voluntariosDtos = voluntariosPaginados.dados.map(
      (voluntario) => new VoluntarioResumoDto(voluntario),
    );

    return new PaginacaoRespostaDto<VoluntarioResumoDto>(
      voluntariosDtos,
      voluntariosPaginados.meta.totalItens,
      voluntariosPaginados.meta.itensPorPagina,
      voluntariosPaginados.meta.paginaAtual,
    );
  }

  @Get(':id')
  @ApiDocBuscarVoluntarioPorId()
  async buscarPorId(@Param('id') id: string): Promise<VoluntarioDto> {
    const voluntario = await this.voluntariosService.buscarPorId(id);
    return new VoluntarioDto(voluntario);
  }

  @Patch(':id')
  @ApiDocAtualizarVoluntario()
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarVoluntarioDto: AtualizarVoluntarioDto,
  ): Promise<VoluntarioDto> {
    const voluntarioAtualizado = await this.voluntariosService.atualizar(
      id,
      atualizarVoluntarioDto,
    );
    return new VoluntarioDto(voluntarioAtualizado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDocRemoverVoluntario()
  async remover(@Param('id') id: string): Promise<void> {
    await this.voluntariosService.remover(id);
  }
}
