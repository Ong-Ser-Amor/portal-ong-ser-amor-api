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
import { AulasService } from 'src/aulas/aulas.service';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { TurmasMatriculasService } from 'src/turmas-matriculas/turmas-matriculas.service';
import { EntityNotFoundError, FindOptionsWhere, Repository } from 'typeorm';

import { AtualizarTurmaDto } from './dto/atualizar-turma.dto';
import { CriarTurmaDto } from './dto/criar-turma.dto';
import { VincularProfessorDto } from './dto/vincular-professor.dto';
import { TurmaProfessor } from './entities/turma-professor';
import { Turma } from './entities/turma.entity';
import { CriterioAvaliacao } from './enums/criterio-avaliacao.enum';
import { StatusTurma } from './enums/status-turma.enum';

@Injectable()
export class TurmasService {
  private readonly logger = new Logger(TurmasService.name);

  constructor(
    @InjectRepository(Turma)
    private readonly repository: Repository<Turma>,
    @InjectRepository(TurmaProfessor)
    private readonly turmaProfessorRepository: Repository<TurmaProfessor>,
    @Inject(forwardRef(() => AulasService))
    private readonly aulasService: AulasService,
    @Inject(forwardRef(() => TurmasMatriculasService))
    private readonly matriculasService: TurmasMatriculasService,
  ) {}

  async criar(criarTurmaDto: CriarTurmaDto): Promise<Turma> {
    this.validarRegrasDeAvaliacao(
      criarTurmaDto.criterioAvaliacao,
      criarTurmaDto.frequenciaMinima,
      criarTurmaDto.notaMinima,
    );

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
    pagina = 1,
    itensPorPagina = 10,
    cursoId?: string,
    planoCursoId?: string,
  ): Promise<PaginacaoRespostaDto<Turma>> {
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

      const where: FindOptionsWhere<Turma> = {};

      if (planoCursoId) {
        where.planoCursoId = planoCursoId;
      }

      if (cursoId) {
        where.planoCurso = {
          cursoId: cursoId,
        };
      }

      const [turmas, total] = await this.repository.findAndCount({
        where,
        relations: ['planoCurso'],
        order: { nome: 'ASC' },
        take,
        skip,
      });

      return new PaginacaoRespostaDto<Turma>(
        turmas,
        total,
        itensPorPagina,
        pagina,
      );
    } catch (erro) {
      if (erro instanceof BadRequestException) {
        throw erro;
      }

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
      return await this.repository.findOneOrFail({
        where: { id },
        relations: [
          'planoCurso',
          'turmasProfessores',
          'turmasProfessores.professor',
          'turmasProfessores.professor.pessoa',
        ],
      });
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

    if (
      atualizarTurmaDto.status === StatusTurma.FINALIZADA &&
      turmaAtual.status !== StatusTurma.FINALIZADA
    ) {
      const possuiAlunosAtivos =
        await this.matriculasService.existeMatriculaAtivaNaTurma(id);

      if (possuiAlunosAtivos) {
        throw new BadRequestException(
          'Não é possível finalizar a turma pois ainda existem alunos com a matrícula no status ATIVA. Altere o status de todas as matrículas para CONCLUIDA ou EVADIDA antes de finalizar a turma.',
        );
      }
    }

    // BLOQUEIO: Valida se a alteração da data de início choca com aulas existentes
    if (atualizarTurmaDto.dataInicio) {
      const novaDataInicio = new Date(atualizarTurmaDto.dataInicio);
      const possuiAulaAnterior = await this.aulasService.existeAulaAnteriorA(
        id,
        novaDataInicio,
      );

      if (possuiAulaAnterior) {
        throw new BadRequestException(
          'Não é possível postergar a data de início da turma, pois já existem aulas cadastradas em datas anteriores a esse novo limite.',
        );
      }
    }

    // BLOQUEIO: Valida se a alteração da data de encerramento choca com aulas existentes
    if (atualizarTurmaDto.dataFim) {
      const novaDataFim = new Date(atualizarTurmaDto.dataFim);
      const possuiAulaPosterior = await this.aulasService.existeAulaPosteriorA(
        id,
        novaDataFim,
      );

      if (possuiAulaPosterior) {
        throw new BadRequestException(
          'Não é possível adiantar a data final da turma, pois já existem aulas cadastradas em datas posteriores a esse novo limite.',
        );
      }
    }

    // Consolida as datas: se o DTO trouxe uma nova, usa a nova; se não, mantém a do banco
    const dataInicioConsolidada =
      atualizarTurmaDto.dataInicio ?? turmaAtual.dataInicio;
    const dataFimConsolidada = atualizarTurmaDto.dataFim ?? turmaAtual.dataFim;

    // Valida a regra de negócio com os dados consolidados
    if (new Date(dataFimConsolidada) < new Date(dataInicioConsolidada)) {
      throw new BadRequestException(
        'A data final não pode ser anterior à data de início da turma.',
      );
    }

    // Consolida e valida os critérios de avaliação (evita misturar dados velhos com novos critérios)
    const criterioConsolidado =
      atualizarTurmaDto.criterioAvaliacao ?? turmaAtual.criterioAvaliacao;

    // Se o DTO enviar explicitamente 'undefined', assumimos o valor atual do banco
    const frequenciaConsolidada =
      atualizarTurmaDto.frequenciaMinima !== undefined
        ? atualizarTurmaDto.frequenciaMinima
        : turmaAtual.frequenciaMinima;

    const notaConsolidada =
      atualizarTurmaDto.notaMinima !== undefined
        ? atualizarTurmaDto.notaMinima
        : turmaAtual.notaMinima;

    this.validarRegrasDeAvaliacao(
      criterioConsolidado,
      frequenciaConsolidada,
      notaConsolidada,
    );

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

  /**
   * Valida se os campos de nota e frequência estão consistentes com o critério escolhido.
   */
  private validarRegrasDeAvaliacao(
    criterio: CriterioAvaliacao,
    frequencia: number | null | undefined,
    nota: string | null | undefined,
  ): void {
    if (criterio === CriterioAvaliacao.SEM_CONTROLE) {
      if (frequencia || nota) {
        throw new BadRequestException(
          'Turmas sem controle de avaliação não podem possuir limites de nota ou frequência mínima.',
        );
      }
    }

    if (criterio === CriterioAvaliacao.POR_PARTICIPACAO) {
      if (!frequencia) {
        throw new BadRequestException(
          'O campo frequência mínima é obrigatório para turmas avaliadas por participação.',
        );
      }
      if (nota) {
        throw new BadRequestException(
          'Turmas avaliadas por participação não devem possuir uma nota mínima de aprovação.',
        );
      }
    }

    if (criterio === CriterioAvaliacao.POR_NOTA_PRESENCA) {
      if (!frequencia || !nota) {
        throw new BadRequestException(
          'Os campos de frequência mínima e nota mínima são obrigatórios para turmas com aprovação por nota e presença.',
        );
      }
    }

    if (criterio === CriterioAvaliacao.QUALITATIVA) {
      if (nota) {
        throw new BadRequestException(
          'Turmas com avaliação qualitativa não devem possuir uma nota mínima numérica de aprovação.',
        );
      }
    }
  }

  async vincularProfessor(
    turmaId: string,
    vincularProfessorDto: VincularProfessorDto,
  ): Promise<TurmaProfessor> {
    await this.buscarPorId(turmaId);

    const vinculoExistente = await this.turmaProfessorRepository.existsBy({
      turmaId,
      professorId: vincularProfessorDto.professorId,
    });

    if (vinculoExistente) {
      throw new ConflictException(
        `O professor com ID ${vincularProfessorDto.professorId} já está vinculado à turma ${turmaId}.`,
      );
    }

    try {
      const novoVinculo = this.turmaProfessorRepository.create({
        turmaId,
        professorId: vincularProfessorDto.professorId,
      });
      return await this.turmaProfessorRepository.save(novoVinculo);
    } catch (erro) {
      // Converte o erro unknown para um tipo seguro que contenha um 'code' opcional
      // para que o TypeScript permita acessar essa propriedade sem apresentar erro de linter
      const erroBanco = erro as { code?: string };

      if (erroBanco?.code === '23503') {
        throw new NotFoundException(
          `Voluntário (Professor) com ID ${vincularProfessorDto.professorId} não encontrado.`,
        );
      }

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao vincular professor à turma: ${mensagemErro}`);

      throw new InternalServerErrorException(
        'Erro ao vincular professor à turma.',
      );
    }
  }

  async desvincularProfessor(
    turmaId: string,
    professorId: string,
  ): Promise<void> {
    try {
      const resultado = await this.turmaProfessorRepository.softDelete({
        turmaId,
        professorId,
      });

      // Se affected for 0, significa que o vínculo não existia no banco
      if (resultado.affected === 0) {
        throw new NotFoundException(
          'Vínculo entre este professor e esta turma não foi encontrado.',
        );
      }
    } catch (erro) {
      if (erro instanceof NotFoundException) {
        throw erro;
      }

      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Erro ao desvincular professor: ${mensagemErro}`);

      throw new InternalServerErrorException(
        'Erro ao desvincular professor da turma.',
      );
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
