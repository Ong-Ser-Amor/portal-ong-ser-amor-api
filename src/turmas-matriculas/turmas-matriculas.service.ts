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
import { BeneficiariosService } from 'src/beneficiarios/beneficiarios.service';
import { PaginacaoRespostaDto } from 'src/dtos/paginacao-resposta.dto';
import { CriterioAvaliacao } from 'src/turmas/enums/criterio-avaliacao.enum';
import { StatusTurma } from 'src/turmas/enums/status-turma.enum';
import { TurmasService } from 'src/turmas/turmas.service';
import { EntityNotFoundError, Repository } from 'typeorm';

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
    @Inject(BeneficiariosService)
    private readonly beneficiariosService: BeneficiariosService,
    @Inject(TurmasService)
    private readonly turmasService: TurmasService,
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
    limite = 10,
    pagina = 1,
  ): Promise<PaginacaoRespostaDto<TurmaMatricula>> {
    try {
      const take = limite;
      const skip = (pagina - 1) * limite;

      const [matriculas, total] = await this.repository.findAndCount({
        relations: ['turma', 'beneficiario', 'beneficiario.pessoa'],
        take,
        skip,
      });

      return new PaginacaoRespostaDto<TurmaMatricula>(
        matriculas,
        total,
        limite,
        pagina,
      );
    } catch (erro) {
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

    if (matriculaAtual.turma.status === StatusTurma.CANCELADA) {
      throw new BadRequestException(
        'Não é possível alterar dados de matrículas vinculadas a uma turma que foi cancelada.',
      );
    }

    if (matriculaAtual.turma.status === StatusTurma.FINALIZADA) {
      throw new BadRequestException(
        'Esta turma já foi finalizada. Para alterar notas ou pareceres dos alunos, a coordenação precisa reabrir a turma primeiro.',
      );
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
    this.validarRegrasDeMatricula(
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
   * Método privado para isolar e aplicar as restrições de encerramento da matrícula
   */
  private validarRegrasDeMatricula(
    criterioTurma: CriterioAvaliacao,
    status: StatusMatricula,
    resultado: ResultadoFinalMatricula | null,
    nota: string | null,
  ): void {
    // Se a matrícula foi concluída em uma turma que possui avaliação obrigatória, exige o veredito
    if (
      status === StatusMatricula.CONCLUIDA &&
      criterioTurma === CriterioAvaliacao.POR_NOTA_PRESENCA
    ) {
      if (!resultado) {
        throw new BadRequestException(
          'É obrigatório definir o resultado final (APROVADO/REPROVADO) para turmas com avaliação por nota.',
        );
      }
      if (!nota) {
        throw new BadRequestException(
          'A turma foi configurada para avaliação por nota, portanto é obrigatório informar a nota final do aluno.',
        );
      }
    }

    // Abordagem limpa acordada: se a turma é sem controle, o resultado deve permanecer nulo
    if (criterioTurma === CriterioAvaliacao.SEM_CONTROLE) {
      if (resultado) {
        throw new BadRequestException(
          'Turmas sem controle de avaliação não aceitam o preenchimento de resultado final.',
        );
      }
      if (nota) {
        throw new BadRequestException(
          'Não é permitido atribuir pontuação/nota para turmas sem controle de avaliação.',
        );
      }
    }

    // Se o critério for qualitativo, rejeitamos qualquer atribuição de nota
    if (criterioTurma === CriterioAvaliacao.QUALITATIVA && nota) {
      throw new BadRequestException(
        'Turmas com avaliação qualitativa não aceitam o preenchimento de nota final.',
      );
    }
  }
}
