import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChamadasService } from 'src/chamadas/chamadas.service';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { StatusTurma } from 'src/turmas/enums/status-turma.enum';
import { TurmasService } from 'src/turmas/turmas.service';
import { EntityManager, EntityNotFoundError, Repository } from 'typeorm';

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
    @Inject(forwardRef(() => ChamadasService))
    private readonly chamadasService: ChamadasService,
    @Inject(forwardRef(() => TurmasService))
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
    pagina = 1,
    itensPorPagina = 10,
    turmaId?: string,
  ): Promise<PaginacaoRespostaDto<Aula>> {
    try {
      if (pagina < 1) {
        throw new BadRequestException(
          'O número da página deve ser maior ou igual a 1.',
        );
      }

      if (itensPorPagina < 1) {
        throw new BadRequestException(
          'O número de itens por página deve ser maior ou igual a 1.',
        );
      }

      const take = itensPorPagina;
      const skip = (pagina - 1) * itensPorPagina;

      const whereCondition = turmaId ? { turmaId } : {};

      const [aulas, total] = await this.repository.findAndCount({
        where: whereCondition,
        order: { data: 'ASC' },
        take,
        skip,
      });

      return new PaginacaoRespostaDto<Aula>(
        aulas,
        total,
        itensPorPagina,
        pagina,
      );
    } catch (erro) {
      if (erro instanceof BadRequestException) {
        throw erro;
      }

      const mensajeErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Erro ao buscar listagem de aulas: ${mensajeErro}`);
      throw new InternalServerErrorException(
        'Erro ao buscar listagem de aulas.',
      );
    }
  }

  async buscarPorId(
    id: string,
    gerenciadorTransacao?: EntityManager,
  ): Promise<Aula> {
    const manager = gerenciadorTransacao || this.repository.manager;

    try {
      return await manager.findOneOrFail(Aula, {
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
    gerenciadorTransacao?: EntityManager,
  ): Promise<Aula> {
    // Define qual manager usar (o da transação ativa ou o padrão do repositório)
    const manager = gerenciadorTransacao || this.repository.manager;

    const aulaAtual = await this.buscarPorId(id, manager);

    const possuiChamadaSalva = await this.chamadasService.existeChamadaParaAula(
      id,
      manager,
    );

    if (possuiChamadaSalva) {
      if (atualizarAulaDto.status === StatusAula.AGENDADA) {
        throw new BadRequestException(
          'Esta aula já possui registros de presença lançados e não pode retornar ao status de AGENDADA.',
        );
      }
      if (atualizarAulaDto.status === StatusAula.CANCELADA) {
        throw new BadRequestException(
          'Não é possível CANCELAR uma aula que já possui registros de chamada salvos no sistema.',
        );
      }
    }

    if (
      atualizarAulaDto.status === StatusAula.REALIZADA &&
      !possuiChamadaSalva
    ) {
      throw new BadRequestException(
        'Não é possível marcar uma aula como REALIZADA sem antes registrar o lote de chamadas dos alunos.',
      );
    }

    if (atualizarAulaDto.data) {
      this.validarLimitesPeriodoTurma(
        atualizarAulaDto.data,
        aulaAtual.turma.dataInicio,
        aulaAtual.turma.dataFim,
      );

      if (atualizarAulaDto.data !== aulaAtual.data) {
        await this.verificarDuplicidadeData(
          aulaAtual.turmaId,
          atualizarAulaDto.data,
        );
      }
    }

    try {
      this.repository.merge(aulaAtual, atualizarAulaDto);
      return await manager.save(Aula, aulaAtual);
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

    const possuiChamadaSalva =
      await this.chamadasService.existeChamadaParaAula(id);

    if (possuiChamadaSalva) {
      throw new BadRequestException(
        'Esta aula não pode ser removida do cronograma pois já possui histórico de chamadas vinculado.',
      );
    }

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

  /**
   * Verifica se existe alguma aula na turma com data anterior à nova data especificada.
   */
  async existeAulaAnteriorA(
    turmaId: string,
    dataLimite: string,
  ): Promise<boolean> {
    try {
      const resultado = await this.repository
        .createQueryBuilder('aula')
        .where('aula.turmaId = :turmaId', { turmaId })
        .andWhere('aula.data < :dataLimite', { dataLimite })
        .getExists();

      return resultado;
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao verificar aulas anteriores a ${dataLimite} na turma ${turmaId}: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao validar calendário de aulas existentes.',
      );
    }
  }

  /**
   * Verifica se existe alguma aula na turma com data posterior à nova data especificada.
   */
  async existeAulaPosteriorA(
    turmaId: string,
    dataLimite: string,
  ): Promise<boolean> {
    try {
      const resultado = await this.repository
        .createQueryBuilder('aula')
        .where('aula.turmaId = :turmaId', { turmaId })
        .andWhere('aula.data > :dataLimite', { dataLimite })
        .getExists();

      return resultado;
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao verificar aulas posteriores a ${dataLimite} na turma ${turmaId}: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao validar calendário de aulas existentes.',
      );
    }
  }

  // =========================================================================
  // MÉTODOS PRIVADOS DE VALIDAÇÃO (REGRAS DE NEGÓCIO)
  // =========================================================================

  private validarLimitesPeriodoTurma(
    dataDaAula: string,
    dataInicioDaTurma: string,
    dataFimDaTurma: string,
  ): void {
    if (dataDaAula < dataInicioDaTurma) {
      throw new BadRequestException(
        `A data da aula não pode ser anterior à data de início da turma (${dataInicioDaTurma}).`,
      );
    }

    if (dataDaAula > dataFimDaTurma) {
      throw new BadRequestException(
        `A data da aula não pode ser posterior à data de encerramento da turma (${dataFimDaTurma}).`,
      );
    }
  }

  private async verificarDuplicidadeData(
    turmaId: string,
    data: string,
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
