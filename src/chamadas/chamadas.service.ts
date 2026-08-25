import {
  BadRequestException,
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
import { StatusAula } from 'src/aulas/enums/status-aula.enum';
import { PayloadJwtDto } from 'src/autenticacao/dto/payload-jwt.dto';
import { TurmasMatriculasService } from 'src/turmas-matriculas/turmas-matriculas.service';
import { DataSource, EntityManager, Repository } from 'typeorm';

import {
  CriarChamadaLoteDto,
  RegistroPresencaDto,
} from './dto/criar-chamada.dto';
import { Chamada } from './entities/chamada.entity';

@Injectable()
export class ChamadasService {
  private readonly logger = new Logger(ChamadasService.name);

  constructor(
    @InjectRepository(Chamada)
    private readonly repository: Repository<Chamada>,
    @Inject(forwardRef(() => AulasService))
    private readonly aulasService: AulasService,
    @Inject(forwardRef(() => TurmasMatriculasService))
    private readonly matriculasService: TurmasMatriculasService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Salva o lote completo de chamadas de uma aula (Insere novos ou Atualiza existentes) dentro de uma Transação
   */
  async salvarChamadaLote(
    criarChamadaLoteDto: CriarChamadaLoteDto,
    usuario: PayloadJwtDto,
  ): Promise<Chamada[]> {
    const aula = await this.aulasService.buscarPorId(
      criarChamadaLoteDto.aulaId,
      usuario,
    );

    if (aula.status === StatusAula.CANCELADA) {
      throw new BadRequestException(
        'Não é possível registrar ou alterar a lista de presença de uma aula que foi CANCELADA.',
      );
    }

    // Valida a integridade dos alunos enviados contra as matrículas ativas da turma
    await this.validarIntegridadeDosAlunosNoLote(
      aula.turmaId,
      criarChamadaLoteDto.registros,
    );

    // Valida as regras de negócio individuais de presença e justificativa
    this.validarRegrasJustificativa(criarChamadaLoteDto.registros);

    // Inicializa o gerenciador da transação atômica do banco de dados
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Busca o histórico existente utilizando o manager da transação para garantir isolamento
      const chamadasExistentes = await queryRunner.manager.find(Chamada, {
        where: { aulaId: criarChamadaLoteDto.aulaId },
      });

      const mapaChamadasExistentes = new Map(
        chamadasExistentes.map((c) => [c.matriculaId, c]),
      );

      // Prepara o array de entidades mapeando os IDs existentes para forçar o UPDATE correto
      const entidadesParaSalvar = criarChamadaLoteDto.registros.map(
        (registro) => {
          const chamadaBanco = mapaChamadasExistentes.get(registro.matriculaId);

          return queryRunner.manager.create(Chamada, {
            id: chamadaBanco ? chamadaBanco.id : undefined,
            aulaId: criarChamadaLoteDto.aulaId,
            matriculaId: registro.matriculaId,
            presente: registro.presente,
            faltaJustificada: registro.presente
              ? false
              : (registro.faltaJustificada ?? false),
            motivoJustificativa: registro.presente
              ? null
              : (registro.motivoJustificativa ?? null),
            observacao: registro.observacao ?? null,
          });
        },
      );

      // Salva as chamadas em lote usando o manager da transação
      const chamadasSalvas = await queryRunner.manager.save(
        Chamada,
        entidadesParaSalvar,
      );

      // Se a aula ainda estava como AGENDADA, atualiza o status para REALIZADA, pois a presença foi registrada
      if (aula.status === StatusAula.AGENDADA) {
        await this.aulasService.atualizar(
          criarChamadaLoteDto.aulaId,
          { status: StatusAula.REALIZADA },
          usuario,
          queryRunner.manager, // Repassando o manager para unificar a transação
        );
      }

      await queryRunner.commitTransaction();

      return chamadasSalvas;
    } catch (erro) {
      await queryRunner.rollbackTransaction();

      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao processar o lote de chamadas para a aula ${criarChamadaLoteDto.aulaId}: ${mensagemErro}`,
      );

      if (
        erro instanceof BadRequestException ||
        erro instanceof NotFoundException ||
        erro instanceof ForbiddenException
      ) {
        throw erro;
      }

      throw new InternalServerErrorException(
        'Erro interno ao salvar a lista de chamadas.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async buscarPorAula(
    aulaId: string,
    usuario: PayloadJwtDto,
  ): Promise<Chamada[]> {
    await this.aulasService.buscarPorId(aulaId, usuario);

    try {
      return await this.repository.find({
        where: { aulaId },
        relations: [
          'matricula',
          'matricula.beneficiario',
          'matricula.beneficiario.pessoa',
        ],
        order: { matricula: { beneficiario: { pessoa: { nome: 'ASC' } } } },
      });
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao buscar chamadas da aula ${aulaId}: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao buscar a lista de presenças da aula.',
      );
    }
  }

  /**
   * Remove todo o lote de chamadas de uma aula (limpa a lista de presença lançada por engano).
   * Se a aula estiver como REALIZADA, reverte automaticamente para AGENDADA dentro da mesma transação.
   */
  async removerPorAula(aulaId: string, usuario: PayloadJwtDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Busca a aula dentro do contexto da transação
      const aula = await this.aulasService.buscarPorId(
        aulaId,
        usuario,
        queryRunner.manager,
      );

      // 2. Verifica a existência de chamadas usando o manager da transação
      const possuiChamada = await this.existeChamadaParaAula(
        aulaId,
        queryRunner.manager,
      );

      if (!possuiChamada) {
        throw new NotFoundException(
          `A aula com ID ${aulaId} não possui registros de chamada para serem removidos.`,
        );
      }

      // 3. Realiza o soft delete em todas as chamadas vinculadas a esta aula
      await queryRunner.manager.softDelete(Chamada, { aulaId });

      // 4. Se a aula estava REALIZADA por conta do registro de chamada, reverte para AGENDADA
      if (aula.status === StatusAula.REALIZADA) {
        await this.aulasService.atualizar(
          aulaId,
          { status: StatusAula.AGENDADA },
          usuario,
          queryRunner.manager,
        );
      }

      await queryRunner.commitTransaction();
    } catch (erro) {
      await queryRunner.rollbackTransaction();

      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao remover chamadas da aula ${aulaId}: ${mensagemErro}`,
      );

      if (
        erro instanceof BadRequestException ||
        erro instanceof NotFoundException ||
        erro instanceof ForbiddenException
      ) {
        throw erro;
      }

      throw new InternalServerErrorException(
        'Erro interno ao remover a lista de chamadas da aula.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Verifica se já existem registros de presença cadastrados para uma determinada aula.
   * Aceita um EntityManager opcional para rodar de forma segura dentro de transações de outros módulos.
   */
  async existeChamadaParaAula(
    aulaId: string,
    gerenciadorTransacao?: EntityManager,
  ): Promise<boolean> {
    // Escolhe o gerenciador correto (o da transação ativa ou o padrão da service)
    const manager = gerenciadorTransacao || this.repository.manager;

    try {
      return await manager.exists(Chamada, {
        where: { aulaId },
      });
    } catch (erro) {
      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao verificar existência de chamada para a aula ${aulaId}: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao validar histórico de presenças da aula.',
      );
    }
  }

  // =========================================================================
  // MÉTODOS PRIVADOS DE VALIDAÇÃO (REGRAS DE NEGÓCIO)
  // =========================================================================

  private async validarIntegridadeDosAlunosNoLote(
    turmaId: string,
    registrosDto: RegistroPresencaDto[],
  ): Promise<void> {
    const matriculasAtivas =
      await this.matriculasService.buscarIdsMatriculasAtivasPorTurma(turmaId);

    const conjuntoMatriculasDto = new Set(
      registrosDto.map((r) => r.matriculaId),
    );
    const conjuntoMatriculasBanco = new Set(matriculasAtivas);

    // Verifica se faltou algum aluno da turma no DTO enviado
    for (const idBanco of conjuntoMatriculasBanco) {
      if (!conjuntoMatriculasDto.has(idBanco)) {
        throw new BadRequestException(
          'Lista de chamada incompleta. Todos os alunos ativos matriculados na turma devem receber marcação de presença ou falta.',
        );
      }
    }

    // Verifica se o DTO enviou algum aluno que não faz parte ou não está ativo na turma
    for (const idDto of conjuntoMatriculasDto) {
      if (!conjuntoMatriculasBanco.has(idDto)) {
        throw new BadRequestException(
          `O registro de matrícula com ID ${idDto} enviado não pertence a esta turma ou não se encontra ativo.`,
        );
      }
    }
  }

  private validarRegrasJustificativa(
    registrosDto: RegistroPresencaDto[],
  ): void {
    for (const registro of registrosDto) {
      if (registro.presente === false && registro.faltaJustificada === true) {
        if (!registro.motivoJustificativa) {
          throw new BadRequestException(
            `Inconsistência identificada. É obrigatório informar o motivo da justificativa para a falta da matrícula ID ${registro.matriculaId}.`,
          );
        }
      }
    }
  }
}
