import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginacaoRespostaDto } from 'src/dtos/paginacao-resposta.dto';
import { StatusTurma } from 'src/turmas/enums/status-turma.enum';
import { TurmasService } from 'src/turmas/turmas.service';
import { EntityNotFoundError, Repository } from 'typeorm';

import { AtualizarAulaDto } from './dto/atualizar-aula.dto';
import { CriarAulaDto } from './dto/criar-aula.dto';
import { Aula } from './entities/aula.entity';
import { StatusAula } from './enums/status-aula.enum';

@Injectable()
export class AulasService {
  private readonly logger = new Logger(AulasService.name);

  constructor(
    @InjectRepository(Aula)
    private readonly repository: Repository<Aula>,
    @Inject(TurmasService)
    private readonly turmasService: TurmasService,
  ) {}

  async criar(criarAulaDto: CriarAulaDto): Promise<Aula> {
    const turma = await this.turmasService.buscarPorId(criarAulaDto.turmaId);

    if (turma.status !== StatusTurma.EM_ANDAMENTO) {
      throw new BadRequestException(
        `Não é possível cadastrar aulas para uma turma com o status de '${turma.status}'. A turma deve estar estritamente EM_ANDAMENTO.`,
      );
    }

    this.validarLimitesPeriodoTurma(
      criarAulaDto.data,
      turma.dataInicio,
      turma.dataFim,
    );

    await this.verificarDuplicidadeData(
      criarAulaDto.turmaId,
      criarAulaDto.data,
    );

    try {
      const novaAula = this.repository.create({
        ...criarAulaDto,
        status: StatusAula.AGENDADA,
      });

      return await this.repository.save(novaAula);
    } catch (erro) {
      const mensajeErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Erro ao criar aula: ${mensajeErro}`);
      throw new InternalServerErrorException(
        'Erro interno ao processar o cadastro da aula.',
      );
    }
  }

  async buscarTodas(
    limite = 10,
    pagina = 1,
    turmaId?: string,
  ): Promise<PaginacaoRespostaDto<Aula>> {
    try {
      const take = limite;
      const skip = (pagina - 1) * limite;

      const whereCondition = turmaId ? { turmaId } : {};

      const [aulas, total] = await this.repository.findAndCount({
        where: whereCondition,
        order: { data: 'ASC' },
        take,
        skip,
      });

      return new PaginacaoRespostaDto<Aula>(aulas, total, limite, pagina);
    } catch (erro) {
      const mensajeErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Erro ao buscar listagem de aulas: ${mensajeErro}`);
      throw new InternalServerErrorException(
        'Erro ao buscar listagem de aulas.',
      );
    }
  }

  async buscarPorId(id: string): Promise<Aula> {
    try {
      return await this.repository.findOneOrFail({
        where: { id },
        relations: ['turma'],
      });
    } catch (erro) {
      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(
          `Aula com ID ${id} não encontrada no diário de classe.`,
        );
      }
      const mensajeErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Erro ao buscar aula por ID: ${mensajeErro}`);
      throw new InternalServerErrorException(
        'Erro ao buscar registro de aula.',
      );
    }
  }

  async atualizar(
    id: string,
    atualizarAulaDto: AtualizarAulaDto,
  ): Promise<Aula> {
    const aulaAtual = await this.buscarPorId(id);

    // Valida as condições para alteração do status da aula, caso o status seja alterado para REALIZADA
    if (aulaAtual.status === StatusAula.REALIZADA && atualizarAulaDto.status) {
      if (atualizarAulaDto.status === StatusAula.AGENDADA) {
        throw new BadRequestException(
          'Uma aula com chamada já realizada não pode retornar ao status de AGENDADA.',
        );
      }
      if (atualizarAulaDto.status === StatusAula.CANCELADA) {
        throw new BadRequestException(
          'Uma aula com chamada já realizada não pode ser alterada para CANCELADA.',
        );
      }
    }

    if (atualizarAulaDto.data) {
      this.validarLimitesPeriodoTurma(
        atualizarAulaDto.data,
        aulaAtual.turma.dataInicio,
        aulaAtual.turma.dataFim,
      );

      if (
        new Date(atualizarAulaDto.data).getTime() !==
        new Date(aulaAtual.data).getTime()
      ) {
        await this.verificarDuplicidadeData(
          aulaAtual.turmaId,
          atualizarAulaDto.data,
        );
      }
    }

    try {
      this.repository.merge(aulaAtual, atualizarAulaDto);
      return await this.repository.save(aulaAtual);
    } catch (erro) {
      const mensajeErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Erro ao atualizar registro de aula: ${mensajeErro}`);
      throw new InternalServerErrorException(
        'Erro ao salvar as modificações da aula.',
      );
    }
  }

  async remover(id: string): Promise<void> {
    await this.buscarPorId(id);
    try {
      await this.repository.softDelete(id);
    } catch (erro) {
      const mensajeErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Erro ao remover aula: ${mensajeErro}`);
      throw new InternalServerErrorException(
        'Erro ao remover o registro de aula.',
      );
    }
  }

  // =========================================================================
  // MÉTODOS PRIVADOS DE VALIDAÇÃO (REGRAS DE NEGÓCIO)
  // =========================================================================

  private validarLimitesPeriodoTurma(
    dataDaAula: Date,
    dataInicioDaTurma: Date,
    dataFimDaTurma: Date,
  ): void {
    if (dataDaAula < dataInicioDaTurma) {
      const dataInicioFormatada = dataInicioDaTurma.toISOString().split('T')[0];
      throw new BadRequestException(
        `A data da aula não pode ser anterior à data de início da turma (${dataInicioFormatada}).`,
      );
    }

    if (dataDaAula > dataFimDaTurma) {
      const dataFimFormatada = dataFimDaTurma.toISOString().split('T')[0];
      throw new BadRequestException(
        `A data da aula não pode ser posterior à data de encerramento da turma (${dataFimFormatada}).`,
      );
    }
  }

  private async verificarDuplicidadeData(
    turmaId: string,
    data: Date,
  ): Promise<void> {
    const existeDuplicidade = await this.repository.existsBy({
      turmaId,
      data,
    });

    if (existeDuplicidade) {
      throw new ConflictException(
        'Já existe uma aula cadastrada nesta mesma data para esta turma.',
      );
    }
  }
}
