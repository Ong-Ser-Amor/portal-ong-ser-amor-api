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

import { AtualizarFamiliaDto } from './dto/atualizar-familia.dto';
import { FamiliaRespostaDto } from './dto/familia-resposta.dto';
import { FamiliasService } from './familias.service';

@ApiTags('Famílias')
@Perfis(PerfilAcesso.ADMINISTRADOR)
@Controller('familias')
export class FamiliasController {
  constructor(private readonly familiasService: FamiliasService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados da família' })
  @ApiOkResponse({
    description: 'A família foi atualizada com sucesso.',
    type: FamiliaRespostaDto,
  })
  @ApiNotFoundResponse({
    description: 'Família não encontrada.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Ocorreu um erro inesperado ao atualizar a família.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() atualizarFamiliaDto: AtualizarFamiliaDto,
  ): Promise<FamiliaRespostaDto> {
    const familiaAtualizada = await this.familiasService.atualizar(
      id,
      atualizarFamiliaDto,
    );
    return new FamiliaRespostaDto(familiaAtualizada);
  }
}
