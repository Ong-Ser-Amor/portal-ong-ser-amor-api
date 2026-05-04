import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { PessoaRespostaDto } from './dto/pessoa-resposta.dto';
import { PessoasService } from './pessoas.service';

@ApiTags('Pessoas')
@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Get('cpf/:cpf')
  @ApiOperation({
    summary: 'Buscar pessoa pelo CPF',
  })
  @ApiParam({
    name: 'cpf',
    required: true,
    example: '12345678900',
    description: 'CPF com 11 dígitos numéricos.',
  })
  @ApiOkResponse({
    description: 'Pessoa encontrada com sucesso.',
    type: PessoaRespostaDto,
  })
  @ApiBadRequestResponse({
    description: 'CPF inválido.',
  })
  @ApiNotFoundResponse({
    description: 'Pessoa não encontrada.',
  })
  async buscarPorCpf(@Param('cpf') cpf: string): Promise<PessoaRespostaDto> {
    if (!/^\d{11}$/.test(cpf)) {
      throw new BadRequestException('O CPF deve conter exatamente 11 dígitos.');
    }

    const pessoa = await this.pessoasService.buscarPorCpf(cpf);
    return new PessoaRespostaDto(pessoa);
  }
}
