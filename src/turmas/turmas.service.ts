import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginacaoRespostaDto } from 'src/dtos/paginacao-resposta.dto';
import { EntityNotFoundError, Repository } from 'typeorm';

import { AtualizarTurmaDto } from './dto/atualizar-turma.dto';
import { CriarTurmaDto } from './dto/criar-turma.dto';
import { Turma } from './entities/turma.entity';

@Injectable()
export class TurmasService {
  private readonly logger = new Logger(TurmasService.name);

  constructor(
    @InjectRepository(Turma)
    private readonly repository: Repository<Turma>,
  ) {}

  async criar(criarTurmaDto: CriarTurmaDto): Promise<Turma> {
    await this.verificarDuplicidadeNome(
      criarTurmaDto.nome,
      criarTurmaDto.planoCursoId,
    );

    try {
      const turma = this.repository.create(criarTurmaDto);
      return this.repository.save(turma);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao criar turma: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao criar turma.');
    }
  }

  async buscarTodos(
    limite = 10,
    pagina = 1,
  ): Promise<PaginacaoRespostaDto<Turma>> {
    try {
      const take = limite;
      const skip = (pagina - 1) * limite;

      const [turmas, total] = await this.repository.findAndCount({
        order: { nome: 'ASC' },
        take,
        skip,
      });

      return new PaginacaoRespostaDto<Turma>(turmas, total, limite, pagina);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao buscar turmas: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao buscar turmas.');
    }
  }

  async buscarPorId(id: string): Promise<Turma> {
    try {
      return await this.repository.findOneByOrFail({ id });
    } catch (erro) {
      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(`Turma com ID ${id} não encontrada.`);
      }

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao buscar turma por ID: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao buscar turma por ID.');
    }
  }

  async atualizar(
    id: string,
    atualizarTurmaDto: AtualizarTurmaDto,
  ): Promise<Turma> {
    const turmaAtual = await this.buscarPorId(id);

    // Consolida as datas: se o DTO trouxe uma nova, usa a nova; se não, mantém a do banco
    const dataInicioConsolidada =
      atualizarTurmaDto.dataInicio ?? turmaAtual.dataInicio;
    const dataFimConsolidada = atualizarTurmaDto.dataFim ?? turmaAtual.dataFim;

    // Valida a regra de negócio com os dados consolidados
    // (Garante a comparação de objetos Date do JS)
    if (new Date(dataFimConsolidada) < new Date(dataInicioConsolidada)) {
      throw new BadRequestException(
        'A data final não pode ser anterior à data de início da turma.',
      );
    }

    if (atualizarTurmaDto.nome && atualizarTurmaDto.nome !== turmaAtual.nome) {
      await this.verificarDuplicidadeNome(
        atualizarTurmaDto.nome,
        turmaAtual.planoCursoId,
        id,
      );
    }

    try {
      this.repository.merge(turmaAtual, atualizarTurmaDto);
      return await this.repository.save(turmaAtual);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao atualizar turma: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao atualizar turma.');
    }
  }

  async remover(id: string): Promise<void> {
    await this.buscarPorId(id);

    try {
      await this.repository.softDelete(id);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao remover turma: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao remover turma.');
    }
  }

  private async verificarDuplicidadeNome(
    nome: string,
    planoCursoId: string,
    turmaIgnoradaId?: string,
  ): Promise<void> {
    const nomeNormalizado = nome.trim();
    const queryBuilder = this.repository
      .createQueryBuilder('turma')
      .where('turma.planoCursoId = :planoCursoId', { planoCursoId })
      .andWhere(
        'LOWER(f_unaccent(turma.nome)) = LOWER(f_unaccent(:nomeNormalizado))',
        { nomeNormalizado },
      );

    // Se for uma atualização, ignorar o registro atual
    if (turmaIgnoradaId) {
      queryBuilder.andWhere('turma.id != :turmaIgnoradaId', {
        turmaIgnoradaId,
      });
    }

    const turmaExistente = await queryBuilder.getExists();

    if (turmaExistente) {
      throw new ConflictException(
        `Já existe uma turma cadastrada com o nome '${nome}' para este plano de curso.`,
      );
    }
  }
}
