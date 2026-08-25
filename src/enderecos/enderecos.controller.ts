import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Perfis } from 'src/shared/decorators/perfis.decorator';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

import { AtualizarEnderecoDto } from './dto/atualizar-endereco.dto';
import { EnderecoRespostaDto } from './dto/endereco-resposta.dto';
import { EnderecosService } from './enderecos.service';

@ApiTags('Endereços')
@Perfis(PerfilAcesso.ADMIN)
@Controller('enderecos')
export class EnderecosController {
  constructor(private readonly enderecosService: EnderecosService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados de um endereço' })
  @ApiOkResponse({
    description: 'O endereço foi atualizado com sucesso.',
    type: EnderecoRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Endereço com o ID especificado não encontrado.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar o endereço.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarEnderecoDto: AtualizarEnderecoDto,
  ): Promise<EnderecoRespostaDto> {
    const enderecoAtualizado = await this.enderecosService.atualizar(
      id,
      atualizarEnderecoDto,
    );
    return new EnderecoRespostaDto(enderecoAtualizado);
  }
}
