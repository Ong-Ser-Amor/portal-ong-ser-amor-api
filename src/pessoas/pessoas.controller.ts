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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { AtualizarPessoaDto } from './dto/atualizar-pessoa.dto';
import { PessoaRespostaDto } from './dto/pessoa-resposta.dto';
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
    type: PessoaRespostaDto,
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
  ): Promise<PessoaRespostaDto> {
    // Chama o serviço para atualizar os dados
    const pessoaAtualizada = await this.pessoasService.atualizar(
      id,
      atualizarPessoaDto,
    );

    return new PessoaRespostaDto(pessoaAtualizada);
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
    type: PessoaRespostaDto,
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
  async verificarCadastroVoluntarioPorCpf(
    @Param('cpf') cpf: string,
  ): Promise<PessoaRespostaDto> {
    if (!/^\d{11}$/.test(cpf)) {
      throw new BadRequestException('O CPF deve conter exatamente 11 dígitos.');
    }

    const pessoa =
      await this.pessoasService.verificarCadastroVoluntarioPorCpf(cpf);
    return new PessoaRespostaDto(pessoa);
  }
}
