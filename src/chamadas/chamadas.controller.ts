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
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { PayloadJwtDto } from 'src/autenticacao/dto/payload-jwt.dto';
import { Perfis } from 'src/shared/decorators/perfis.decorator';
import { UsuarioLogado } from 'src/shared/decorators/usuario-logado.decorator';
import { PerfilAcesso } from 'src/usuarios/enums/perfil-acesso.enum';

import { ChamadasService } from './chamadas.service';
import {
  ApiDocBuscarChamadasPorAula,
  ApiDocRemoverChamadasPorAula,
  ApiDocSalvarChamadaLote,
} from './chamadas.swagger';
import { ChamadaRespostaDto } from './dto/chamada-resposta.dto';
import { CriarChamadaLoteDto } from './dto/criar-chamada.dto';

@ApiTags('Chamadas (presença nas aulas)')
@ApiForbiddenResponse({
  description:
    'Usuário não tem permissão para acessar ou manipular presenças de aulas desta turma.',
})
@Perfis(PerfilAcesso.COORDENADOR_CURSOS, PerfilAcesso.PROFESSOR)
@Controller('chamadas')
export class ChamadasController {
  constructor(private readonly chamadasService: ChamadasService) {}

  @Post('lote')
  @HttpCode(HttpStatus.OK)
  @ApiDocSalvarChamadaLote()
  async salvarLote(
    @Body() criarChamadaLoteDto: CriarChamadaLoteDto,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<ChamadaRespostaDto[]> {
    const chamadas = await this.chamadasService.salvarChamadaLote(
      criarChamadaLoteDto,
      usuario,
    );

    return chamadas.map((chamada) => new ChamadaRespostaDto(chamada));
  }

  @Get('aula/:aulaId')
  @ApiDocBuscarChamadasPorAula()
  async buscarPorAula(
    @Param('aulaId') aulaId: string,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<ChamadaRespostaDto[]> {
    const chamadas = await this.chamadasService.buscarPorAula(aulaId, usuario);

    return chamadas.map((chamada) => new ChamadaRespostaDto(chamada));
  }

  @Delete('aula/:aulaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDocRemoverChamadasPorAula()
  async removerPorAula(
    @Param('aulaId') aulaId: string,
    @UsuarioLogado() usuario: PayloadJwtDto,
  ): Promise<void> {
    await this.chamadasService.removerPorAula(aulaId, usuario);
  }
}
