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
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Perfis } from 'src/shared/decorators/perfis.decorator';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

import { ContatosService } from './contatos.service';
import { AtualizarContatoDto } from './dto/atualizar-contato.dto';
import { ContatoDto } from './dto/contato.dto';
import { CriarContatoDto } from './dto/criar-contato.dto';

@ApiTags('Contatos')
@Perfis(PerfilAcesso.ADMIN)
@Controller('contatos')
export class ContatosController {
  constructor(private readonly contatosService: ContatosService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo contato para uma pessoa' })
  @ApiCreatedResponse({
    description: 'O contato foi cadastrado com sucesso.',
    type: ContatoDto,
  })
  @ApiBadRequestResponse({
    description:
      'Dados inválidos enviados na requisição ou violação das regras de negócio (ex: máximo de 3 contatos por pessoa, máximo de 2 celulares/1 email/1 fixo, exatamente 1 contato principal).',
  })
  @ApiConflictResponse({
    description: 'Este número ou e-mail já está cadastrado para esta pessoa.',
  })
  @ApiNotFoundResponse({
    description: 'Pessoa não encontrada.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao cadastrar o contato.',
  })
  async criar(@Body() criarContatoDto: CriarContatoDto): Promise<ContatoDto> {
    const contatoCriado = await this.contatosService.criar(criarContatoDto);
    return new ContatoDto(contatoCriado);
  }

  @Get('pessoa/:pessoaId')
  @ApiOperation({ summary: 'Buscar todos os contatos de uma pessoa' })
  @ApiParam({ name: 'pessoaId', description: 'ID da pessoa', type: String })
  @ApiOkResponse({
    description: 'Lista de contatos da pessoa retornada com sucesso.',
    type: [ContatoDto],
  })
  @ApiNotFoundResponse({
    description: 'Pessoa não encontrada.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar os contatos.',
  })
  async buscarPorPessoaId(
    @Param('pessoaId') pessoaId: string,
  ): Promise<ContatoDto[]> {
    const contatos = await this.contatosService.buscarPorPessoaId(pessoaId);
    return contatos.map((contato) => new ContatoDto(contato));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados de um contato existente' })
  @ApiParam({ name: 'id', description: 'ID do contato', type: String })
  @ApiOkResponse({
    description: 'O contato foi atualizado com sucesso.',
    type: ContatoDto,
  })
  @ApiBadRequestResponse({
    description:
      'Dados inválidos enviados na requisição ou violação das regras de negócio de contatos.',
  })
  @ApiConflictResponse({
    description:
      'Já existe outro contato cadastrado com este valor para esta pessoa.',
  })
  @ApiNotFoundResponse({
    description: 'Contato não encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar o contato.',
  })
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
  @ApiOperation({ summary: 'Remover um contato existente' })
  @ApiParam({ name: 'id', description: 'ID do contato', type: String })
  @ApiNoContentResponse({
    description: 'O contato foi removido com sucesso.',
  })
  @ApiBadRequestResponse({
    description:
      'Não é permitido remover o contato se a pessoa (adulto/emancipado) ficar sem contatos ou se for o único contato principal.',
  })
  @ApiNotFoundResponse({
    description: 'Contato não encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao remover o contato.',
  })
  async remover(@Param('id') id: string): Promise<void> {
    await this.contatosService.remover(id);
  }
}
