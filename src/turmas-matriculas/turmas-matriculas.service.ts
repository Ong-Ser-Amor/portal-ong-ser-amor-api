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
import { BeneficiariosService } from 'src/beneficiarios/beneficiarios.service';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { CriterioAvaliacao } from 'src/turmas/enums/criterio-avaliacao.enum';
import { StatusTurma } from 'src/turmas/enums/status-turma.enum';
import { TurmasService } from 'src/turmas/turmas.service';
import { TurmaAtividadeEntrega } from 'src/turmas-atividades/entities/turma-atividade-entrega.entity';
import { StatusEntrega } from 'src/turmas-atividades/enums/status-entrega.enum';
import { EntityNotFoundError, FindOptionsWhere, Repository } from 'typeorm';

import { ERROS_ATUALIZACAO_MATRICULA } from './constants/turmas-matriculas-erros.constant';
import { AtualizarTurmaMatriculaDto } from './dto/atualizar-turma-matricula.dto';
import { CriarTurmaMatriculaDto } from './dto/criar-turma-matricula.dto';
import { TurmaMatricula } from './entities/turmas-matricula.entity';
import { ResultadoFinalMatricula } from './enums/resultado-final-matricula.enum';
import { StatusMatricula } from './enums/status-matricula.enum';

@Injectable()
export class TurmasMatriculasService {
  private readonly logger = new Logger(TurmasMatriculasService.name);

  constructor(
    @InjectRepository(TurmaMatricula)
    private readonly repository: Repository<TurmaMatricula>,
    @InjectRepository(TurmaAtividadeEntrega)
    private readonly entregaRepository: Repository<TurmaAtividadeEntrega>,
    @Inject(BeneficiariosService)
    private readonly beneficiariosService: BeneficiariosService,
    @Inject(forwardRef(() => TurmasService))
    private readonly turmasService: TurmasService,
    @Inject(forwardRef(() => AulasService))
    private readonly aulasService: AulasService,
  ) {}

  async criar(
    criarTurmaMatriculaDto: CriarTurmaMatriculaDto,
  ): Promise<TurmaMatricula> {
    // Busca a turma dona do domínio e valida o seu status atual
    const turma = await this.turmasService.buscarPorId(
      criarTurmaMatriculaDto.turmaId,
    );

    if (turma.status === StatusTurma.FINALIZADA) {
      throw new BadRequestException(
        'Não é possível matricular alunos em uma turma já concluída.',
      );
    }

    if (turma.status === StatusTurma.CANCELADA) {
      throw new BadRequestException(
        'Não é possível matricular alunos em uma turma que foi cancelada.',
      );
    }

    // Garante que o aluno (beneficiario) existe no sistema
    await this.beneficiariosService.verificarExistenciaPorId(
      criarTurmaMatriculaDto.beneficiarioId,
    );

    // Impede duplicidade de matrícula ativa para o mesmo aluno na mesma turma
    const matriculaDuplicada = await this.repository.existsBy({
      turmaId: criarTurmaMatriculaDto.turmaId,
      beneficiarioId: criarTurmaMatriculaDto.beneficiarioId,
    });

    if (matriculaDuplicada) {
      throw new ConflictException(
        'Este beneficiário já está matriculado nesta turma.',
      );
    }

    try {
      // Toda matrícula nova nasce obrigatoriamente com o status ativa
      const novaMatricula = this.repository.create({
        ...criarTurmaMatriculaDto,
        status: StatusMatricula.ATIVA,
      });

      return await this.repository.save(novaMatricula);
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Erro ao criar matrícula: ${mensagemErro}`);
      throw new InternalServerErrorException(
        'Erro ao processar matrícula do beneficiário.',
      );
    }
  }

  async buscarTodas(
    pagina = 1,
    itensPorPagina = 10,
    turmaId?: string,
  ): Promise<PaginacaoRespostaDto<TurmaMatricula>> {
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

      const where: FindOptionsWhere<TurmaMatricula> = {};
      if (turmaId) {
        where.turmaId = turmaId;
      }

      const take = itensPorPagina;
      const skip = (pagina - 1) * itensPorPagina;

      const [matriculas, total] = await this.repository.findAndCount({
        where,
        relations: ['turma', 'beneficiario', 'beneficiario.pessoa'],
        take,
        skip,
        order: { id: 'ASC' },
      });

      return new PaginacaoRespostaDto<TurmaMatricula>(
        matriculas,
        total,
        itensPorPagina,
        pagina,
      );
    } catch (erro) {
      if (erro instanceof BadRequestException) {
        throw erro;
      }

      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao buscar listagem de matrículas: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao buscar listagem de matrículas.',
      );
    }
  }

  async buscarPorId(id: string): Promise<TurmaMatricula> {
    try {
      return await this.repository.findOneOrFail({
        where: { id },
        relations: ['turma', 'beneficiario', 'beneficiario.pessoa'],
      });
    } catch (erro) {
      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(
          `Registro de matrícula com ID ${id} não encontrado.`,
        );
      }
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Erro ao buscar matrícula por ID: ${mensagemErro}`);
      throw new InternalServerErrorException(
        'Erro ao buscar registro de matrícula.',
      );
    }
  }

  async atualizar(
    id: string,
    atualizarTurmaMatriculaDto: AtualizarTurmaMatriculaDto,
  ): Promise<TurmaMatricula> {
    const matriculaAtual = await this.buscarPorId(id);

    if (matriculaAtual.turma.status !== StatusTurma.EM_ANDAMENTO) {
      throw new BadRequestException({
        codigo: ERROS_ATUALIZACAO_MATRICULA.TURMA_NAO_EM_ANDAMENTO.codigo,
        message: `${ERROS_ATUALIZACAO_MATRICULA.TURMA_NAO_EM_ANDAMENTO.mensagem} Status atual da turma: ${matriculaAtual.turma.status}`,
      });
    }

    // Consolida os dados novos com os já existentes na memória para validação das regras
    const statusConsolidado =
      atualizarTurmaMatriculaDto.status ?? matriculaAtual.status;
    const resultadoConsolidado =
      atualizarTurmaMatriculaDto.resultadoFinal !== undefined
        ? atualizarTurmaMatriculaDto.resultadoFinal
        : matriculaAtual.resultadoFinal;
    const notaConsolidada =
      atualizarTurmaMatriculaDto.notaFinal !== undefined
        ? atualizarTurmaMatriculaDto.notaFinal
        : matriculaAtual.notaFinal;

    // Executa a validação cruzada com base nas regras herdadas da turma
    await this.validarRegrasDeMatricula(
      id,
      matriculaAtual.turmaId,
      matriculaAtual.turma.criterioAvaliacao,
      statusConsolidado,
      resultadoConsolidado,
      notaConsolidada,
    );

    try {
      this.repository.merge(matriculaAtual, atualizarTurmaMatriculaDto);
      return await this.repository.save(matriculaAtual);
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao atualizar registro de matrícula: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao salvar atualizações da matrícula.',
      );
    }
  }

  async remover(id: string): Promise<void> {
    await this.buscarPorId(id);
    try {
      await this.repository.softDelete(id);
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(`Erro ao remover matrícula: ${mensagemErro}`);
      throw new InternalServerErrorException(
        'Erro ao remover registro de matrícula.',
      );
    }
  }

  /**
   * Verifica se existe alguma matrícula ativa para uma determinada turma.
   */
  async existeMatriculaAtivaNaTurma(turmaId: string): Promise<boolean> {
    try {
      return await this.repository.existsBy({
        turmaId,
        status: StatusMatricula.ATIVA,
      });
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao verificar matrículas ativas na turma ${turmaId}: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao validar situação das matrículas da turma.',
      );
    }
  }

  /**
   * Busca e retorna apenas os IDs das matrículas que estão atualmente ATIVAS em uma turma específica.
   * Valida previamente se a turma informada existe no sistema antes de listar os estudantes.
   */
  async buscarIdsMatriculasAtivasPorTurma(turmaId: string): Promise<string[]> {
    await this.turmasService.buscarPorId(turmaId);

    try {
      const matriculas = await this.repository.find({
        select: ['id'],
        where: {
          turmaId,
          status: StatusMatricula.ATIVA,
        },
      });

      // Transforma o array de objetos [{ id: '1' }] em um array de strings puro ['1']
      return matriculas.map((matricula) => matricula.id);
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao buscar lista de IDs de matrículas ativas para a turma ${turmaId}: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro interno ao validar a lista de estudantes ativos da turma.',
      );
    }
  }

  /**
   * Método privado para isolar e aplicar as restrições de encerramento da matrícula
   */
  private async validarRegrasDeMatricula(
    matriculaId: string,
    turmaId: string,
    criterioTurma: CriterioAvaliacao,
    status: StatusMatricula,
    resultado: ResultadoFinalMatricula | null,
    nota: string | null,
  ): Promise<void> {
    // 1. Matrículas com status diferente de CONCLUIDA (ATIVA, EVADIDA, CANCELADA) não podem possuir resultado nem nota
    if (status !== StatusMatricula.CONCLUIDA) {
      if (resultado !== null && resultado !== undefined) {
        throw new BadRequestException({
          codigo:
            ERROS_ATUALIZACAO_MATRICULA.MATRICULA_NAO_CONCLUIDA_COM_RESULTADO
              .codigo,
          message:
            ERROS_ATUALIZACAO_MATRICULA.MATRICULA_NAO_CONCLUIDA_COM_RESULTADO
              .mensagem,
        });
      }

      if (nota !== null && nota !== undefined) {
        throw new BadRequestException({
          codigo:
            ERROS_ATUALIZACAO_MATRICULA.MATRICULA_NAO_CONCLUIDA_COM_NOTA.codigo,
          message:
            ERROS_ATUALIZACAO_MATRICULA.MATRICULA_NAO_CONCLUIDA_COM_NOTA
              .mensagem,
        });
      }

      return;
    }

    // 2. Regras para matrículas que estão sendo CONCLUÍDAS (status === StatusMatricula.CONCLUIDA)
    const possuiAulasAgendadas =
      await this.aulasService.possuiAulasAgendadas(turmaId);
    if (possuiAulasAgendadas) {
      throw new BadRequestException({
        codigo: ERROS_ATUALIZACAO_MATRICULA.TURMA_POSSUI_AULAS_AGENDADAS.codigo,
        message:
          ERROS_ATUALIZACAO_MATRICULA.TURMA_POSSUI_AULAS_AGENDADAS.mensagem,
      });
    }
    switch (criterioTurma) {
      case CriterioAvaliacao.POR_NOTA_PRESENCA: {
        if (!resultado) {
          throw new BadRequestException({
            codigo:
              ERROS_ATUALIZACAO_MATRICULA.RESULTADO_FINAL_OBRIGATORIO.codigo,
            message:
              ERROS_ATUALIZACAO_MATRICULA.RESULTADO_FINAL_OBRIGATORIO.mensagem,
          });
        }
        if (!nota) {
          throw new BadRequestException({
            codigo: ERROS_ATUALIZACAO_MATRICULA.NOTA_FINAL_OBRIGATORIA.codigo,
            message:
              ERROS_ATUALIZACAO_MATRICULA.NOTA_FINAL_OBRIGATORIA.mensagem,
          });
        }
        await this.validarAtividadesAvaliativasConcluidas(matriculaId);
        break;
      }

      case CriterioAvaliacao.QUALITATIVA: {
        if (!resultado) {
          throw new BadRequestException({
            codigo:
              ERROS_ATUALIZACAO_MATRICULA.QUALITATIVA_RESULTADO_OBRIGATORIO
                .codigo,
            message:
              ERROS_ATUALIZACAO_MATRICULA.QUALITATIVA_RESULTADO_OBRIGATORIO
                .mensagem,
          });
        }
        if (nota) {
          throw new BadRequestException({
            codigo:
              ERROS_ATUALIZACAO_MATRICULA.QUALITATIVA_NOTA_INVALIDA.codigo,
            message:
              ERROS_ATUALIZACAO_MATRICULA.QUALITATIVA_NOTA_INVALIDA.mensagem,
          });
        }
        break;
      }

      case CriterioAvaliacao.POR_PARTICIPACAO: {
        if (!resultado) {
          throw new BadRequestException({
            codigo:
              ERROS_ATUALIZACAO_MATRICULA.PARTICIPACAO_RESULTADO_OBRIGATORIO
                .codigo,
            message:
              ERROS_ATUALIZACAO_MATRICULA.PARTICIPACAO_RESULTADO_OBRIGATORIO
                .mensagem,
          });
        }
        if (nota) {
          throw new BadRequestException({
            codigo:
              ERROS_ATUALIZACAO_MATRICULA.PARTICIPACAO_NOTA_INVALIDA.codigo,
            message:
              ERROS_ATUALIZACAO_MATRICULA.PARTICIPACAO_NOTA_INVALIDA.mensagem,
          });
        }
        break;
      }

      case CriterioAvaliacao.SEM_CONTROLE: {
        if (resultado) {
          throw new BadRequestException({
            codigo:
              ERROS_ATUALIZACAO_MATRICULA.SEM_CONTROLE_RESULTADO_INVALIDO
                .codigo,
            message:
              ERROS_ATUALIZACAO_MATRICULA.SEM_CONTROLE_RESULTADO_INVALIDO
                .mensagem,
          });
        }
        if (nota) {
          throw new BadRequestException({
            codigo:
              ERROS_ATUALIZACAO_MATRICULA.SEM_CONTROLE_NOTA_INVALIDA.codigo,
            message:
              ERROS_ATUALIZACAO_MATRICULA.SEM_CONTROLE_NOTA_INVALIDA.mensagem,
          });
        }
        break;
      }
    }
  }

  /**
   * Garante que o estudante não possui atividades que valem nota com entrega PENDENTE ou ENTREGUE sem nota lançada.
   */
  private async validarAtividadesAvaliativasConcluidas(
    matriculaId: string,
  ): Promise<void> {
    const entregaPendente = await this.entregaRepository
      .createQueryBuilder('entrega')
      .innerJoinAndSelect('entrega.atividade', 'atividade')
      .where('entrega.matriculaId = :matriculaId', { matriculaId })
      .andWhere('atividade.valeNota = true')
      .andWhere(
        '(entrega.statusEntrega = :pendente OR (entrega.statusEntrega IN (:...statusEntregues) AND entrega.notaObtida IS NULL))',
        {
          pendente: StatusEntrega.PENDENTE,
          statusEntregues: [
            StatusEntrega.ENTREGUE,
            StatusEntrega.ENTREGUE_COM_ATRASO,
          ],
        },
      )
      .getOne();

    if (entregaPendente) {
      throw new BadRequestException({
        codigo:
          ERROS_ATUALIZACAO_MATRICULA.ATIVIDADE_AVALIATIVA_PENDENTE.codigo,
        message: `Não é possível concluir a matrícula pois a atividade avaliativa '${entregaPendente.atividade.titulo}' está pendente de entrega ou sem nota atribuída para este aluno.`,
      });
    }
  }
}
