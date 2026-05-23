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
import { PaginacaoRespostaDto } from 'src/dtos/paginacao-resposta.dto';
import { CriarPessoaDto } from 'src/pessoas/dto/criar-pessoa.dto';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { calcularIdade } from 'src/utils/calculadora-idade';
import { DataSource, EntityNotFoundError, Repository } from 'typeorm';

import { AtualizarBeneficiarioDto } from './dto/atualizar-beneficiario.dto';
import { CriarBeneficiarioDto } from './dto/criar-beneficiario.dto';
import { Beneficiario } from './entities/beneficiario.entity';

@Injectable()
export class BeneficiariosService {
  private readonly logger = new Logger(BeneficiariosService.name);

  constructor(
    @InjectRepository(Beneficiario)
    private readonly repository: Repository<Beneficiario>,
    @Inject(forwardRef(() => PessoasService))
    private readonly pessoasService: PessoasService,
    private readonly dataSource: DataSource,
  ) {}

  async criar(
    criarBeneficiarioDto: CriarBeneficiarioDto,
  ): Promise<Beneficiario> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.validarRegrasMenoridade(
        criarBeneficiarioDto.dataNascimento,
        criarBeneficiarioDto.emancipado,
        criarBeneficiarioDto.responsavelId,
      );

      let pessoaId = criarBeneficiarioDto.pessoaId;

      if (!pessoaId) {
        // Cenario A: Id da pessoa não fornecido (pessoa não existe).

        const dadosPessoa: CriarPessoaDto = {
          nome: criarBeneficiarioDto.nome,
          cpf: criarBeneficiarioDto.cpf,
          dataNascimento: criarBeneficiarioDto.dataNascimento,
          podeSairSozinho: criarBeneficiarioDto.podeSairSozinho,
          responsavelId: criarBeneficiarioDto.responsavelId,
          emancipado: criarBeneficiarioDto.emancipado,
        };

        // Passa o queryRunner.manager para garantir que a pessoa será criada na mesma transação
        const novaPessoa = await this.pessoasService.criar(
          dadosPessoa,
          queryRunner.manager,
        );
        pessoaId = novaPessoa.id;
      } else {
        // Cenario B: Id da pessoa fornecido (pessoa já existe).
        await this.pessoasService.buscarPorId(pessoaId, queryRunner.manager);
      }

      const beneficioExistente = await queryRunner.manager.findOne(
        Beneficiario,
        {
          where: { pessoaId },
        },
      );

      if (beneficioExistente) {
        throw new ConflictException(
          'Esta pessoa já possui um cadastro de beneficiário ativo.',
        );
      }

      const beneficiario = new Beneficiario({
        pessoaId,
        familiaId: criarBeneficiarioDto.familiaId,
        nivelEscolaridade: criarBeneficiarioDto.nivelEscolaridade,
        estadoCivil: criarBeneficiarioDto.estadoCivil,
        vinculoEmpregaticio: criarBeneficiarioDto.vinculoEmpregaticio,
        quantidadeFilhos: criarBeneficiarioDto.quantidadeFilhos,
      });

      const beneficiarioSalvo = await queryRunner.manager.save(beneficiario);

      // Carrega as relações com Pessoa e Familia DENTRO da transação antes de fazer commit
      const beneficiarioComRelacoes = await queryRunner.manager.findOneOrFail(
        Beneficiario,
        {
          where: { id: beneficiarioSalvo.id },
          relations: ['pessoa', 'familia'],
        },
      );

      await queryRunner.commitTransaction();

      return beneficiarioComRelacoes;
    } catch (erro) {
      await queryRunner.rollbackTransaction();

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${JSON.stringify(erro)}`;

      this.logger.error(`Erro ao criar beneficiário: ${mensagemErro}`);

      // Repassa erros (NotFound, Conflict)
      if (
        erro instanceof NotFoundException ||
        erro instanceof ConflictException
      ) {
        throw erro;
      }

      throw new InternalServerErrorException('Erro ao criar o beneficiário.');
    } finally {
      await queryRunner.release();
    }
  }

  async buscarTodos(
    take = 10,
    skip = 0,
  ): Promise<PaginacaoRespostaDto<Beneficiario>> {
    try {
      const [beneficiarios, total] = await this.repository.findAndCount({
        relations: ['pessoa', 'familia'],
        take,
        skip,
        order: { pessoa: { nome: 'ASC' } },
      });

      return new PaginacaoRespostaDto<Beneficiario>(
        beneficiarios,
        total,
        take,
        skip,
      );
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;

      this.logger.error(`Erro ao buscar beneficiários: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao buscar beneficiários.');
    }
  }

  async buscarPorId(id: string): Promise<Beneficiario> {
    try {
      return await this.repository.findOneOrFail({
        where: { id },
        relations: ['pessoa', 'familia'],
      });
    } catch (erro) {
      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(
          `Beneficiário com ID ${id} não encontrado.`,
        );
      }

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;

      this.logger.error(`Erro ao buscar beneficiário: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao buscar beneficiário.');
    }
  }

  async atualizar(
    id: string,
    atualizarBeneficiarioDto: AtualizarBeneficiarioDto,
  ): Promise<Beneficiario> {
    const beneficiarioAtual = await this.buscarPorId(id);

    // O Update DTO pode trazer dados parciais. Para a validação, é preciso consolidar os dados atuais com os novos,
    // dando preferência aos novos quando existirem.
    const dataNascConsolidada =
      atualizarBeneficiarioDto.dataNascimento ??
      beneficiarioAtual.pessoa.dataNascimento;

    const emancipadoConsolidado =
      atualizarBeneficiarioDto.emancipado ??
      beneficiarioAtual.pessoa.emancipado;

    const responsavelConsolidado =
      atualizarBeneficiarioDto.responsavelId !== undefined
        ? atualizarBeneficiarioDto.responsavelId
        : beneficiarioAtual.pessoa.responsavelId;

    // 1. Aplica a Regra de Negócio Centralizada antes de abrir transação
    this.validarRegrasMenoridade(
      dataNascConsolidada,
      emancipadoConsolidado,
      responsavelConsolidado,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dadosPessoa = {
        nome: atualizarBeneficiarioDto.nome,
        cpf: atualizarBeneficiarioDto.cpf,
        dataNascimento: atualizarBeneficiarioDto.dataNascimento,
        podeSairSozinho: atualizarBeneficiarioDto.podeSairSozinho,
        responsavelId: atualizarBeneficiarioDto.responsavelId,
        emancipado: atualizarBeneficiarioDto.emancipado,
      };

      // 1. DELEGAÇÃO: Se vier algum dado de pessoa, a PessoasService atualiza na mesma transação
      if (
        dadosPessoa.nome !== undefined ||
        dadosPessoa.cpf !== undefined ||
        dadosPessoa.dataNascimento !== undefined ||
        dadosPessoa.podeSairSozinho !== undefined ||
        dadosPessoa.responsavelId !== undefined ||
        dadosPessoa.emancipado !== undefined
      ) {
        const pessoaAtualizada = await this.pessoasService.atualizar(
          beneficiarioAtual.pessoa.id,
          dadosPessoa,
          queryRunner.manager,
        );

        // Substitui a referência em memória pela pessoa atualizada
        beneficiarioAtual.pessoa = pessoaAtualizada;
      }

      // 2. ATUALIZA OS DADOS ESPECÍFICOS DO BENEFICIÁRIO
      if (atualizarBeneficiarioDto.familiaId !== undefined) {
        beneficiarioAtual.familiaId = atualizarBeneficiarioDto.familiaId;
      }
      if (atualizarBeneficiarioDto.nivelEscolaridade !== undefined) {
        beneficiarioAtual.nivelEscolaridade =
          atualizarBeneficiarioDto.nivelEscolaridade;
      }
      if (atualizarBeneficiarioDto.estadoCivil !== undefined) {
        beneficiarioAtual.estadoCivil = atualizarBeneficiarioDto.estadoCivil;
      }
      if (atualizarBeneficiarioDto.vinculoEmpregaticio !== undefined) {
        beneficiarioAtual.vinculoEmpregaticio =
          atualizarBeneficiarioDto.vinculoEmpregaticio;
      }
      if (atualizarBeneficiarioDto.quantidadeFilhos !== undefined) {
        beneficiarioAtual.quantidadeFilhos =
          atualizarBeneficiarioDto.quantidadeFilhos;
      }

      const beneficiarioAtualizado =
        await queryRunner.manager.save(beneficiarioAtual);

      await queryRunner.commitTransaction();

      return beneficiarioAtualizado;
    } catch (erro) {
      await queryRunner.rollbackTransaction();

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${JSON.stringify(erro)}`;

      this.logger.error(`Erro ao atualizar beneficiário: ${mensagemErro}`);

      if (
        erro instanceof ConflictException ||
        erro instanceof NotFoundException ||
        erro instanceof BadRequestException
      ) {
        throw erro;
      }

      throw new InternalServerErrorException(
        'Erro ao atualizar o beneficiário.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async remover(id: string): Promise<void> {
    await this.buscarPorId(id);

    try {
      // Realiza o Soft Delete apenas na tabela de beneficiários
      // A tabela 'pessoas' permanece intacta neste momento.
      // A limpeza de pessoas órfãs (sem papéis) é feita por uma Cron Job
      await this.repository.softDelete(id);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;

      this.logger.error(`Erro ao remover beneficiário: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao remover beneficiário.');
    }
  }

  // =========================================================================
  // MÉTODOS PRIVADOS DE VALIDAÇÃO (REGRAS DE NEGÓCIO)
  // =========================================================================

  /**
   * Valida se a pessoa atende aos requisitos legais de idade e emancipação.
   * Lança exceções (BadRequest) se as regras forem violadas.
   */
  private validarRegrasMenoridade(
    dataNascimento: Date,
    emancipado?: boolean,
    responsavelId?: string | null,
  ): void {
    const idade = calcularIdade(dataNascimento);

    if (idade < 18) {
      if (emancipado) {
        if (idade < 16) {
          throw new BadRequestException(
            'Apenas maiores de 16 anos podem ser emancipados.',
          );
        }
        // Se tem 16 ou 17 e é emancipado, passa direto!
      } else {
        // Se é menor de 18 e NÃO é emancipado, TEM que ter responsável
        if (!responsavelId) {
          throw new BadRequestException(
            'O beneficiário é menor de idade e não é emancipado. É obrigatório informar o responsável (responsavelId) no cadastro da pessoa.',
          );
        }
      }
    }
  }

  async verificarExistenciaPorPessoaId(pessoaId: string): Promise<boolean> {
    try {
      return await this.repository.existsBy({ pessoaId });
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;

      this.logger.error(
        `Erro ao verificar existência de beneficiário por pessoa ID: ${mensagemErro}`,
      );

      throw new InternalServerErrorException(
        'Erro interno ao verificar o vínculo de beneficiário.',
      );
    }
  }
}
