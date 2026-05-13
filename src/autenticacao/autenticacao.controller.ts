import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Publico } from 'src/decorators/publico.decorator';

import { AutenticacaoService } from './autenticacao.service';
import { LoginRespostaDto } from './dto/login-resposta.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Autenticacao')
@Controller('autenticacao')
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @Publico()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Realizar login no sistema para obter o token de acesso',
  })
  @ApiOkResponse({
    description: 'Login realizado com sucesso.',
    type: LoginRespostaDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos (ex: e-mail mal formatado).',
  })
  @ApiUnauthorizedResponse({
    description: 'E-mail ou senha inválidos.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro interno no servidor.',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginRespostaDto> {
    const respostaLogin = await this.autenticacaoService.login(loginDto);
    return new LoginRespostaDto(respostaLogin);
  }
}
