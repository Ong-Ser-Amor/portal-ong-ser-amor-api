import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ChamadasService } from './chamadas.service';
import { ChamadaRespostaDto } from './dto/chamada-resposta.dto';
import { CriarChamadaLoteDto } from './dto/criar-chamada.dto';

@ApiTags('Chamadas (presença nas aulas)')
@Controller('chamadas')
export class ChamadasController {
  constructor(private readonly chamadasService: ChamadasService) {}

  @Post('lote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Registrar ou atualizar a lista de chamada (presenças/faltas) de uma aula em lote',
  })
  @ApiOkResponse({
    description: 'O lote de chamadas foi processado e salvo com sucesso.',
    type: [ChamadaRespostaDto],
  })
  @ApiBadRequestResponse({
    description:
      'A lista enviada está incompleta, contém alunos não ativos/não pertencentes à turma, a aula está CANCELADA ou houve inconsistência nas justificativas de falta.',
  })
  @ApiNotFoundResponse({
    description: 'A aula informada pelo ID não foi encontrada no sistema.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao processar a lista de chamadas.',
  })
  async salvarLote(
    @Body() criarChamadaLoteDto: CriarChamadaLoteDto,
  ): Promise<ChamadaRespostaDto[]> {
    const chamadas =
      await this.chamadasService.salvarChamadaLote(criarChamadaLoteDto);

    // Transforma o array de entidades resultantes utilizando o DTO de resposta padronizado
    return chamadas.map((chamada) => new ChamadaRespostaDto(chamada));
  }

  @Get('aula/:aulaId')
  @ApiOperation({
    summary: 'Buscar a lista de chamadas preenchida de uma aula específica',
  })
  @ApiOkResponse({
    description: 'A lista de chamadas da aula foi recuperada com sucesso.',
    type: [ChamadaRespostaDto],
  })
  @ApiNotFoundResponse({
    description:
      'A aula especificada não possui registros de chamada ou não foi encontrada.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao buscar as presenças da aula.',
  })
  async buscarPorAula(
    @Param('aulaId') aulaId: string,
  ): Promise<ChamadaRespostaDto[]> {
    const chamadas = await this.chamadasService.buscarPorAula(aulaId);

    return chamadas.map((chamada) => new ChamadaRespostaDto(chamada));
  }

  @Delete('aula/:aulaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover o lote de chamadas de uma aula (limpar presenças)',
    description:
      'Exclui todas as presenças/faltas registradas para a aula especificada (soft delete).\n' +
      'Se a aula estiver com status REALIZADA, o status é revertido automaticamente para AGENDADA.',
  })
  @ApiNoContentResponse({
    description:
      'As presenças da aula foram removidas com sucesso e o status da aula foi revertido para AGENDADA.',
  })
  @ApiNotFoundResponse({
    description:
      'A aula informada não foi encontrada ou não possui registros de chamada para serem removidos.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao remover a lista de chamadas.',
  })
  async removerPorAula(@Param('aulaId') aulaId: string): Promise<void> {
    await this.chamadasService.removerPorAula(aulaId);
  }
}
