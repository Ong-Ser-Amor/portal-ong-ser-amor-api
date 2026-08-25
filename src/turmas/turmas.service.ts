import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AulasService } from 'src/aulas/aulas.service';
import { PayloadJwtDto } from 'src/autenticacao/dto/payload-jwt.dto';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { temAcessoIrrestritoEmCursos } from 'src/shared/utils/permissao-cursos.util';
import { TurmasMatriculasService } from 'src/turmas-matriculas/turmas-matriculas.service';
import { EntityNotFoundError, FindOptionsWhere, Repository } from 'typeorm';

import { ERROS_ATUALIZACAO_TURMA } from './constants/turmas-erros.constant';
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
    @Inject(forwardRef(() => TurmasMatriculasService))
    private readonly matriculasService: TurmasMatriculasService,
    @Inject(forwardRef(() => AulasService))
    private readonly aulasService: AulasService,
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
      const novaTurma = this.repository.create(criarTurmaDto);

      return await this.repository.save(novaTurma);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao cadastrar turma: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao cadastrar turma.');
    }
  }

  async buscarTodos(
    usuario: PayloadJwtDto,
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

      if (!temAcessoIrrestritoEmCursos(usuario)) {
        where.turmasProfessores = {
          professorId: usuario.voluntarioId,
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
      if (
        erro instanceof BadRequestException ||
        erro instanceof ForbiddenException
      ) {
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

  async validarExistencia(id: string): Promise<void> {
    const existe = await this.repository.existsBy({ id });

    if (!existe) {
      throw new NotFoundException(`Turma com ID ${id} não encontrada.`);
    }
  }

  async validarPermissaoAcesso(
    turmaId: string,
    usuario: PayloadJwtDto,
  ): Promise<void> {
    if (!temAcessoIrrestritoEmCursos(usuario)) {
      const temVinculo = await this.turmaProfessorRepository.existsBy({
        turmaId,
        professorId: usuario.voluntarioId,
      });

      if (!temVinculo) {
        await this.validarExistencia(turmaId);
        throw new ForbiddenException(
          'Usuário não tem permissão para acessar ou manipular dados desta turma.',
        );
      }
      return;
    }

    await this.validarExistencia(turmaId);
  }

  async buscarPorId(id: string, usuario: PayloadJwtDto): Promise<Turma> {
    try {
      const turma = await this.repository.findOneOrFail({
        where: { id },
        relations: [
          'planoCurso',
          'planoCurso.curso',
          'turmasProfessores',
          'turmasProfessores.professor',
          'turmasProfessores.professor.pessoa',
        ],
      });

      if (!temAcessoIrrestritoEmCursos(usuario)) {
        const ehProfessorDaTurma = turma.turmasProfessores?.some(
          (turmaProfessor) =>
            turmaProfessor.professorId === usuario.voluntarioId,
        );

        if (!ehProfessorDaTurma) {
          throw new ForbiddenException(
            'Usuário não tem permissão para acessar ou manipular dados desta turma.',
          );
        }
      }

      return turma;
    } catch (erro) {
      if (erro instanceof ForbiddenException) {
        throw erro;
      }

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
    usuario: PayloadJwtDto,
  ): Promise<Turma> {
    const turmaAtual = await this.buscarPorId(id, usuario);

    if (
      atualizarTurmaDto.status === StatusTurma.FINALIZADA &&
      turmaAtual.status !== StatusTurma.FINALIZADA
    ) {
      const possuiAlunosAtivos =
        await this.matriculasService.existeMatriculaAtivaNaTurma(id);

      if (possuiAlunosAtivos) {
        throw new BadRequestException({
          codigo: ERROS_ATUALIZACAO_TURMA.ALUNOS_ATIVOS_AO_FINALIZAR.codigo,
          message: ERROS_ATUALIZACAO_TURMA.ALUNOS_ATIVOS_AO_FINALIZAR.mensagem,
        });
      }
    }

    // BLOQUEIO: Valida se a alteração da data de início choca com aulas existentes
    if (atualizarTurmaDto.dataInicio) {
      const possuiAulaAnterior = await this.aulasService.existeAulaAnteriorA(
        id,
        atualizarTurmaDto.dataInicio,
      );

      if (possuiAulaAnterior) {
        throw new BadRequestException({
          codigo: ERROS_ATUALIZACAO_TURMA.CONFLITO_DATA_INICIO.codigo,
          message: ERROS_ATUALIZACAO_TURMA.CONFLITO_DATA_INICIO.mensagem,
        });
      }
    }

    // BLOQUEIO: Valida se a alteração da data de encerramento choca com aulas existentes
    if (atualizarTurmaDto.dataFim) {
      const possuiAulaPosterior = await this.aulasService.existeAulaPosteriorA(
        id,
        atualizarTurmaDto.dataFim,
      );

      if (possuiAulaPosterior) {
        throw new BadRequestException({
          codigo: ERROS_ATUALIZACAO_TURMA.CONFLITO_DATA_FIM.codigo,
          message: ERROS_ATUALIZACAO_TURMA.CONFLITO_DATA_FIM.mensagem,
        });
      }
    }

    // Consolida as datas: se o DTO trouxe uma nova, usa a nova; se não, mantém a do banco
    const dataInicioConsolidada =
      atualizarTurmaDto.dataInicio ?? turmaAtual.dataInicio;
    const dataFimConsolidada = atualizarTurmaDto.dataFim ?? turmaAtual.dataFim;

    // Valida a regra de negócio com os dados consolidados
    if (dataFimConsolidada < dataInicioConsolidada) {
      throw new BadRequestException({
        codigo: ERROS_ATUALIZACAO_TURMA.DATAS_INVERTIDAS.codigo,
        message: ERROS_ATUALIZACAO_TURMA.DATAS_INVERTIDAS.mensagem,
      });
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
    await this.validarExistencia(id);

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
        throw new BadRequestException({
          codigo: ERROS_ATUALIZACAO_TURMA.CRITERIO_SEM_CONTROLE_INVALIDO.codigo,
          message:
            ERROS_ATUALIZACAO_TURMA.CRITERIO_SEM_CONTROLE_INVALIDO.mensagem,
        });
      }
    }

    if (criterio === CriterioAvaliacao.POR_PARTICIPACAO) {
      if (!frequencia) {
        throw new BadRequestException({
          codigo:
            ERROS_ATUALIZACAO_TURMA.CRITERIO_PARTICIPACAO_SEM_FREQUENCIA.codigo,
          message:
            ERROS_ATUALIZACAO_TURMA.CRITERIO_PARTICIPACAO_SEM_FREQUENCIA
              .mensagem,
        });
      }
      if (nota) {
        throw new BadRequestException({
          codigo: ERROS_ATUALIZACAO_TURMA.CRITERIO_PARTICIPACAO_COM_NOTA.codigo,
          message:
            ERROS_ATUALIZACAO_TURMA.CRITERIO_PARTICIPACAO_COM_NOTA.mensagem,
        });
      }
    }

    if (criterio === CriterioAvaliacao.POR_NOTA_PRESENCA) {
      if (!frequencia || !nota) {
        throw new BadRequestException({
          codigo:
            ERROS_ATUALIZACAO_TURMA.CRITERIO_NOTA_PRESENCA_INCOMPLETO.codigo,
          message:
            ERROS_ATUALIZACAO_TURMA.CRITERIO_NOTA_PRESENCA_INCOMPLETO.mensagem,
        });
      }
    }

    if (criterio === CriterioAvaliacao.QUALITATIVA) {
      if (nota) {
        throw new BadRequestException({
          codigo: ERROS_ATUALIZACAO_TURMA.CRITERIO_QUALITATIVA_COM_NOTA.codigo,
          message:
            ERROS_ATUALIZACAO_TURMA.CRITERIO_QUALITATIVA_COM_NOTA.mensagem,
        });
      }
    }
  }

  async vincularProfessor(
    turmaId: string,
    vincularProfessorDto: VincularProfessorDto,
  ): Promise<TurmaProfessor> {
    await this.validarExistencia(turmaId);

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
