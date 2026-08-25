import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PayloadJwtDto } from 'src/autenticacao/dto/payload-jwt.dto';
import { CriterioAvaliacao } from 'src/turmas/enums/criterio-avaliacao.enum';
import { TurmasService } from 'src/turmas/turmas.service';
import { TurmasMatriculasService } from 'src/turmas-matriculas/turmas-matriculas.service';
import { DataSource, MoreThan, Repository } from 'typeorm';

import { AtualizarTurmaAtividadeDto } from './dto/atualizar-turma-atividade.dto';
import { CriarTurmaAtividadeDto } from './dto/criar-turma-atividade.dto';
import { RegistrarEntregasLoteDto } from './dto/registrar-entregas-lote.dto';
import { TurmaAtividadeEntrega } from './entities/turma-atividade-entrega.entity';
import { TurmaAtividade } from './entities/turmas-atividade.entity';
import { StatusEntrega } from './enums/status-entrega.enum';

@Injectable()
export class TurmasAtividadesService {
  private readonly logger = new Logger(TurmasAtividadesService.name);

  constructor(
    @InjectRepository(TurmaAtividade)
    private readonly atividadeRepository: Repository<TurmaAtividade>,
    @InjectRepository(TurmaAtividadeEntrega)
    private readonly entregaRepository: Repository<TurmaAtividadeEntrega>,
    private readonly turmasService: TurmasService,
    private readonly matriculasService: TurmasMatriculasService,
    private readonly dataSource: DataSource,
  ) {}

  async criarAtividadeComPendenciasDeEntrega(
    criarTurmaAtividadeDto: CriarTurmaAtividadeDto,
    usuario: PayloadJwtDto,
  ): Promise<TurmaAtividade> {
    const turma = await this.turmasService.buscarPorId(
      criarTurmaAtividadeDto.turmaId,
      usuario,
    );

    this.validarRegrasAtividadeConformeTurma(
      turma.criterioAvaliacao,
      criarTurmaAtividadeDto,
    );
    this.validarLimitesDatasTurma(
      turma.dataInicio,
      turma.dataFim,
      criarTurmaAtividadeDto.dataAtribuicao,
      criarTurmaAtividadeDto.prazoEntrega,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Instancia e salva a atividade base
      const novaAtividade = this.atividadeRepository.create({
        ...criarTurmaAtividadeDto,
        notaMaxima: criarTurmaAtividadeDto.notaMaxima
          ? Number(criarTurmaAtividadeDto.notaMaxima)
          : null,
      });
      const atividadeSalva = await queryRunner.manager.save(
        TurmaAtividade,
        novaAtividade,
      );

      const idsMatriculasAtivas =
        await this.matriculasService.buscarIdsMatriculasAtivasPorTurma(
          criarTurmaAtividadeDto.turmaId,
        );

      if (idsMatriculasAtivas.length > 0) {
        const entregasIniciais = idsMatriculasAtivas.map((matriculaId) => {
          return queryRunner.manager.create(TurmaAtividadeEntrega, {
            atividadeId: atividadeSalva.id,
            matriculaId: matriculaId,
            statusEntrega: StatusEntrega.PENDENTE,
            notaObtida: null,
            dataEntrega: null,
          });
        });

        await queryRunner.manager.save(TurmaAtividadeEntrega, entregasIniciais);
      }

      await queryRunner.commitTransaction();
      return atividadeSalva;
    } catch (erro) {
      await queryRunner.rollbackTransaction();
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao criar atividade em transação: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao criar atividade e suas entregas.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async registrarEntregasEmLote(
    registrarEntregasLoteDto: RegistrarEntregasLoteDto,
    usuario: PayloadJwtDto,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const entregaAtualizadaDto of registrarEntregasLoteDto.entregas) {
        const entregaAtual = await queryRunner.manager.findOne(
          TurmaAtividadeEntrega,
          {
            where: { id: entregaAtualizadaDto.entregaId },
            relations: ['atividade'],
          },
        );

        if (!entregaAtual) {
          throw new NotFoundException(
            `Registro de entrega com ID ${entregaAtualizadaDto.entregaId} não localizado.`,
          );
        }

        await this.turmasService.validarPermissaoAcesso(
          entregaAtual.atividade.turmaId,
          usuario,
        );

        const atividade = entregaAtual.atividade;
        let notaNumerica: number | null = null;

        if (
          entregaAtualizadaDto.notaObtida !== undefined &&
          entregaAtualizadaDto.notaObtida !== null
        ) {
          notaNumerica = Number(entregaAtualizadaDto.notaObtida);

          if (!atividade.valeNota) {
            throw new BadRequestException(
              `A atividade '${atividade.titulo}' não aceita notas, pois está configurada como não avaliativa.`,
            );
          }

          if (
            atividade.notaMaxima !== null &&
            notaNumerica > atividade.notaMaxima
          ) {
            throw new BadRequestException(
              `A nota obtida (${notaNumerica}) não pode ultrapassar o limite máximo da atividade (${atividade.notaMaxima}).`,
            );
          }
        }

        let dataEntregaFinal: Date | null = null;
        if (
          entregaAtualizadaDto.statusEntrega === StatusEntrega.ENTREGUE ||
          entregaAtualizadaDto.statusEntrega ===
            StatusEntrega.ENTREGUE_COM_ATRASO
        ) {
          dataEntregaFinal = new Date();
        }

        queryRunner.manager.merge(TurmaAtividadeEntrega, entregaAtual, {
          statusEntrega: entregaAtualizadaDto.statusEntrega,
          notaObtida: notaNumerica,
          dataEntrega: dataEntregaFinal,
          observacao:
            entregaAtualizadaDto.observacao ?? entregaAtual.observacao,
        });

        await queryRunner.manager.save(TurmaAtividadeEntrega, entregaAtual);
      }

      await queryRunner.commitTransaction();
    } catch (erro) {
      await queryRunner.rollbackTransaction();

      if (
        erro instanceof BadRequestException ||
        erro instanceof NotFoundException ||
        erro instanceof ForbiddenException
      ) {
        throw erro;
      }

      this.logger.error(`Erro ao salvar notas em lote: ${String(erro)}`);
      throw new InternalServerErrorException(
        'Erro ao processar as entregas das atividades.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async buscarAtividadesPorTurma(
    turmaId: string,
    usuario: PayloadJwtDto,
  ): Promise<TurmaAtividade[]> {
    await this.turmasService.validarPermissaoAcesso(turmaId, usuario);

    try {
      return await this.atividadeRepository.find({
        where: { turmaId },
        order: { dataAtribuicao: 'ASC' },
      });
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao buscar atividades da turma ${turmaId}: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao listar atividades da turma.',
      );
    }
  }

  async buscarEntregasPorAtividade(
    atividadeId: string,
    usuario: PayloadJwtDto,
  ): Promise<TurmaAtividadeEntrega[]> {
    try {
      const atividade = await this.atividadeRepository.findOne({
        select: ['id', 'turmaId'],
        where: { id: atividadeId },
      });
      if (!atividade) {
        throw new NotFoundException(
          `Atividade com ID ${atividadeId} não encontrada.`,
        );
      }

      await this.turmasService.validarPermissaoAcesso(
        atividade.turmaId,
        usuario,
      );

      return await this.entregaRepository.find({
        where: { atividadeId },
        relations: [
          'matricula',
          'matricula.beneficiario',
          'matricula.beneficiario.pessoa',
        ],
        order: {
          matricula: {
            beneficiario: {
              pessoa: {
                nome: 'ASC',
              },
            },
          },
        },
      });
    } catch (erro) {
      if (
        erro instanceof NotFoundException ||
        erro instanceof ForbiddenException
      ) {
        throw erro;
      }
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao buscar entregas da atividade ${atividadeId}: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao carregar a listagem de entregas.',
      );
    }
  }

  async atualizar(
    id: string,
    atualizarAtividadeDto: AtualizarTurmaAtividadeDto,
    usuario: PayloadJwtDto,
  ): Promise<TurmaAtividade> {
    const atividadeAtual = await this.atividadeRepository.findOne({
      where: { id },
      relations: ['turma'],
    });

    if (!atividadeAtual) {
      throw new NotFoundException(`Atividade com ID ${id} não encontrada.`);
    }

    await this.turmasService.validarPermissaoAcesso(
      atividadeAtual.turmaId,
      usuario,
    );

    // Consolida os dados novos com os já existentes para validação
    const valeNotaConsolidado =
      atualizarAtividadeDto.valeNota ?? atividadeAtual.valeNota;
    const notaMaximaConsolidada =
      atualizarAtividadeDto.notaMaxima !== undefined
        ? atualizarAtividadeDto.notaMaxima
          ? Number(atualizarAtividadeDto.notaMaxima)
          : null
        : atividadeAtual.notaMaxima;
    const dataAtribuicaoConsolidada =
      atualizarAtividadeDto.dataAtribuicao ?? atividadeAtual.dataAtribuicao;
    const prazoEntregaConsolidado =
      atualizarAtividadeDto.prazoEntrega ?? atividadeAtual.prazoEntrega;

    // Valida as regras da turma com os dados consolidados
    this.validarRegrasAtividadeConformeTurma(
      atividadeAtual.turma.criterioAvaliacao,
      {
        ...atividadeAtual,
        ...atualizarAtividadeDto,
        valeNota: valeNotaConsolidado,
        notaMaxima: atualizarAtividadeDto.notaMaxima,
      } as CriarTurmaAtividadeDto,
    );

    // Valida se as datas consolidadas respeitam a vigência da turma
    this.validarLimitesDatasTurma(
      atividadeAtual.turma.dataInicio,
      atividadeAtual.turma.dataFim,
      dataAtribuicaoConsolidada,
      prazoEntregaConsolidado,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // CENÁRIO A: Mudou de 'valeNota = true' para 'valeNota = false'
      if (atividadeAtual.valeNota && valeNotaConsolidado === false) {
        // Limpa todas as notas previamente lançadas para os alunos nesta atividade
        await queryRunner.manager.update(
          TurmaAtividadeEntrega,
          { atividadeId: id },
          { notaObtida: null },
        );
      }

      // CENÁRIO B: Reduziu a nota máxima da atividade
      if (
        valeNotaConsolidado &&
        notaMaximaConsolidada !== null &&
        atividadeAtual.notaMaxima !== null &&
        notaMaximaConsolidada < atividadeAtual.notaMaxima
      ) {
        // Verifica se existe algum aluno com nota maior do que o novo limite
        const existeNotaMaior = await queryRunner.manager.exists(
          TurmaAtividadeEntrega,
          {
            where: {
              atividadeId: id,
              notaObtida: MoreThan(notaMaximaConsolidada),
            },
          },
        );

        if (existeNotaMaior) {
          throw new BadRequestException(
            `Não é possível reduzir a nota máxima para ${notaMaximaConsolidada}, pois já existem alunos com notas registradas superiores a este novo limite. Reavalie ou ajuste as notas dos alunos antes de alterar o limite da atividade.`,
          );
        }
      }

      queryRunner.manager.merge(TurmaAtividade, atividadeAtual, {
        ...atualizarAtividadeDto,
        notaMaxima:
          atualizarAtividadeDto.notaMaxima !== undefined
            ? atualizarAtividadeDto.notaMaxima
              ? Number(atualizarAtividadeDto.notaMaxima)
              : null
            : atividadeAtual.notaMaxima,
      });

      const atividadeAtualizada = await queryRunner.manager.save(
        TurmaAtividade,
        atividadeAtual,
      );

      await queryRunner.commitTransaction();
      return atividadeAtualizada;
    } catch (erro) {
      await queryRunner.rollbackTransaction();
      if (
        erro instanceof BadRequestException ||
        erro instanceof NotFoundException ||
        erro instanceof ForbiddenException
      ) {
        throw erro;
      }
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao atualizar atividade em transação: ${mensagemErro}`,
      );
      throw new InternalServerErrorException('Erro ao atualizar a atividade.');
    } finally {
      await queryRunner.release();
    }
  }

  private validarRegrasAtividadeConformeTurma(
    criterio: CriterioAvaliacao,
    dto: CriarTurmaAtividadeDto,
  ): void {
    const recusaPontuacao = [
      CriterioAvaliacao.SEM_CONTROLE,
      CriterioAvaliacao.POR_PARTICIPACAO,
      CriterioAvaliacao.QUALITATIVA,
    ].includes(criterio);

    if (recusaPontuacao && (dto.valeNota || dto.notaMaxima)) {
      throw new BadRequestException(
        `A turma informada adota o critério '${criterio}'. Atividades deste grupo não podem registrar notas numéricas. Altere valeNota para false.`,
      );
    }

    if (
      criterio === CriterioAvaliacao.POR_NOTA_PRESENCA &&
      dto.valeNota &&
      !dto.notaMaxima
    ) {
      throw new BadRequestException(
        'As atividades avaliativas para turmas de nota e presença exigem a definição de uma nota máxima.',
      );
    }
  }

  private validarLimitesDatasTurma(
    inicioTurma: string,
    fimTurma: string,
    atribuicao: string,
    prazo: string,
  ): void {
    if (
      atribuicao < inicioTurma ||
      atribuicao > fimTurma ||
      prazo < inicioTurma ||
      prazo > fimTurma
    ) {
      throw new BadRequestException(
        'As datas de atribuição e os prazos limite de entrega devem estar contidos estritamente dentro do cronograma de vigência da turma.',
      );
    }
  }
}
