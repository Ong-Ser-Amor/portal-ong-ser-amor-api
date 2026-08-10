import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { AtualizarPessoaDto } from './dto/atualizar-pessoa.dto';
import { PessoaDto } from './dto/pessoa.dto';
import { PessoasService } from './pessoas.service';

@ApiTags('Pessoas')
@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de uma pessoa' })
  @ApiParam({ name: 'id', description: 'ID da pessoa', type: String })
  @ApiOkResponse({
    description: 'Pessoa atualizada com sucesso.',
    type: PessoaDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos enviados na requisição.',
  })
  @ApiNotFoundResponse({
    description: 'Pessoa não encontrada',
  })
  @ApiConflictResponse({
    description: 'Já existe outra pessoa cadastrada com este CPF.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarPessoaDto: AtualizarPessoaDto,
  ): Promise<PessoaDto> {
    // Chama o serviço para atualizar os dados
    const pessoaAtualizada = await this.pessoasService.atualizar(
      id,
      atualizarPessoaDto,
    );

    return new PessoaDto(pessoaAtualizada);
  }

  @Get('verificar-cadastro/beneficiario/cpf/:cpf')
  @ApiOperation({
    summary: 'Verificar cadastro de beneficiário pelo CPF',
  })
  @ApiParam({
    name: 'cpf',
    required: true,
    example: '12345678900',
    description: 'CPF com 11 dígitos numéricos.',
  })
  @ApiOkResponse({
    description: 'Pessoa encontrada com sucesso e sem beneficiário vinculado.',
    type: PessoaDto,
  })
  @ApiBadRequestResponse({
    description: 'CPF inválido.',
  })
  @ApiNotFoundResponse({
    description: 'Pessoa não encontrada.',
  })
  @ApiConflictResponse({
    description: 'Pessoa já possui um cadastro de beneficiário ativo.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno ao verificar o cadastro de beneficiário.',
  })
  async verificarCadastroBeneficiarioPorCpf(
    @Param('cpf') cpf: string,
  ): Promise<PessoaDto> {
    if (!/^\d{11}$/.test(cpf)) {
      throw new BadRequestException('O CPF deve conter exatamente 11 dígitos.');
    }

    const pessoa =
      await this.pessoasService.verificarCadastroBeneficiarioPorCpf(cpf);
    return new PessoaDto(pessoa);
  }

  @Get('verificar-cadastro/voluntario/cpf/:cpf')
  @ApiOperation({
    summary: 'Verificar cadastro de voluntário pelo CPF',
  })
  @ApiParam({
    name: 'cpf',
    required: true,
    example: '12345678900',
    description: 'CPF com 11 dígitos numéricos.',
  })
  @ApiOkResponse({
    description: 'Pessoa encontrada com sucesso e sem voluntário vinculado.',
    type: PessoaDto,
  })
  @ApiBadRequestResponse({
    description: 'CPF inválido.',
  })
  @ApiNotFoundResponse({
    description: 'Pessoa não encontrada.',
  })
  @ApiConflictResponse({
    description: 'Pessoa já possui um cadastro de voluntário ativo.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno ao verificar o cadastro de voluntário.',
  })
  async verificarCadastroVoluntarioPorCpf(
    @Param('cpf') cpf: string,
  ): Promise<PessoaDto> {
    if (!/^\d{11}$/.test(cpf)) {
      throw new BadRequestException('O CPF deve conter exatamente 11 dígitos.');
    }

    const pessoa =
      await this.pessoasService.verificarCadastroVoluntarioPorCpf(cpf);
    return new PessoaDto(pessoa);
  }
}
