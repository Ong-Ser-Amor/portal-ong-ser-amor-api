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

import { BeneficiariosService } from './beneficiarios.service';
import {
  ApiDocAtualizarBeneficiario,
  ApiDocBuscarBeneficiarioPorId,
  ApiDocBuscarBeneficiarios,
  ApiDocCriarBeneficiario,
  ApiDocRemoverBeneficiario,
  ApiDocTransferirFamilia,
  ApiDocVerificarCadastroPorCpf,
} from './beneficiarios.swagger';
import { AtualizarBeneficiarioDto } from './dto/atualizar-beneficiario.dto';
import { BeneficiarioResumoDto } from './dto/beneficiario-resumo.dto';
import { BeneficiarioDto } from './dto/beneficiario.dto';
import { CriarBeneficiarioDto } from './dto/criar-beneficiario.dto';
import { TransferirFamiliaDto } from './dto/transferir-familia.dto';

@ApiTags('Beneficiarios')
@ApiForbiddenResponse({
  description: 'Acesso não autorizado para o perfil do usuário (requer ADMIN).',
})
@Perfis(PerfilAcesso.ADMIN)
@Controller('beneficiarios')
export class BeneficiariosController {
  constructor(private readonly beneficiariosService: BeneficiariosService) { }

  @Post()
  @ApiDocCriarBeneficiario()
  async criar(
    @Body() criarBeneficiarioDto: CriarBeneficiarioDto,
  ): Promise<BeneficiarioDto> {
    const beneficiarioCriado =
      await this.beneficiariosService.criar(criarBeneficiarioDto);
    return new BeneficiarioDto(beneficiarioCriado);
  }

  @Get('verificar-cadastro/cpf/:cpf')
  @ApiDocVerificarCadastroPorCpf()
  async verificarCadastroPorCpf(
    @Param('cpf', ValidarCpfPipe) cpf: string,
  ): Promise<PessoaDto> {
    const pessoa = await this.beneficiariosService.verificarCadastroPorCpf(cpf);
    return new PessoaDto(pessoa);
  }

  @Get()
  @ApiDocBuscarBeneficiarios()
  async buscarTodos(
    @Query('pagina', new DefaultValuePipe(1), ParseIntPipe) pagina: number,
    @Query('itensPorPagina', new DefaultValuePipe(10), ParseIntPipe)
    itensPorPagina: number,
    @Query('nome') nome?: string,
    @Query('cpf') cpf?: string,
    @Query('familiaId') familiaId?: string,
    @Query('ignorarId') ignorarId?: string,
  ): Promise<PaginacaoRespostaDto<BeneficiarioResumoDto>> {
    const beneficiarios = await this.beneficiariosService.buscarTodos(
      pagina,
      itensPorPagina,
      nome,
      cpf,
      familiaId,
      ignorarId,
    );

    const beneficiariosDtos = beneficiarios.dados.map(
      (beneficiario) => new BeneficiarioResumoDto(beneficiario),
    );

    return new PaginacaoRespostaDto<BeneficiarioResumoDto>(
      beneficiariosDtos,
      beneficiarios.meta.totalItens,
      beneficiarios.meta.itensPorPagina,
      beneficiarios.meta.paginaAtual,
    );
  }

  @Get(':id')
  @ApiDocBuscarBeneficiarioPorId()
  async buscarPorId(@Param('id') id: string): Promise<BeneficiarioDto> {
    const beneficiario = await this.beneficiariosService.buscarPorId(id);
    return new BeneficiarioDto(beneficiario);
  }

  @Patch(':id')
  @ApiDocAtualizarBeneficiario()
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarBeneficiarioDto: AtualizarBeneficiarioDto,
  ): Promise<BeneficiarioDto> {
    const beneficiarioAtualizado = await this.beneficiariosService.atualizar(
      id,
      atualizarBeneficiarioDto,
    );
    return new BeneficiarioDto(beneficiarioAtualizado);
  }

  @Patch(':id/transferir-familia')
  @ApiDocTransferirFamilia()
  async transferirFamilia(
    @Param('id') id: string,
    @Body() transferirFamiliaDto: TransferirFamiliaDto,
  ): Promise<BeneficiarioDto> {
    const beneficiarioAtualizado =
      await this.beneficiariosService.transferirFamilia(
        id,
        transferirFamiliaDto,
      );
    return new BeneficiarioDto(beneficiarioAtualizado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDocRemoverBeneficiario()
  async remover(@Param('id') id: string): Promise<void> {
    await this.beneficiariosService.remover(id);
  }
}
