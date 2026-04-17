import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginacaoRespostaDto } from 'src/dtos/paginacao-resposta.dto';
import { CriarPessoaDados } from 'src/pessoas/interfaces/criar-pessoa-dados.interface';
import { PessoasService } from 'src/pessoas/pessoas.service';
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
      let pessoaId = criarBeneficiarioDto.pessoaId;

      if (!pessoaId) {
        // Cenario A: Id da pessoa não fornecido (pessoa não existe).

        const dadosPessoa: CriarPessoaDados = {
          nome: criarBeneficiarioDto.nome,
          cpf: criarBeneficiarioDto.cpf,
          dataNascimento: criarBeneficiarioDto.dataNascimento,
          podeSairSozinho: criarBeneficiarioDto.podeSairSozinho,
          responsavelId: criarBeneficiarioDto.responsavelId,
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

      await queryRunner.commitTransaction();

      return beneficiarioSalvo;
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
    const beneficiario = await this.buscarPorId(id);

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
      };

      const dadosBeneficiario = {
        familiaId: atualizarBeneficiarioDto.familiaId,
        nivelEscolaridade: atualizarBeneficiarioDto.nivelEscolaridade,
        estadoCivil: atualizarBeneficiarioDto.estadoCivil,
        vinculoEmpregaticio: atualizarBeneficiarioDto.vinculoEmpregaticio,
        quantidadeFilhos: atualizarBeneficiarioDto.quantidadeFilhos,
      };

      let pessoaAlterada = false;

      if (dadosPessoa.nome !== undefined) {
        beneficiario.pessoa.nome = dadosPessoa.nome;
        pessoaAlterada = true;
      }
      if (dadosPessoa.cpf !== undefined) {
        beneficiario.pessoa.cpf = dadosPessoa.cpf;
        pessoaAlterada = true;
      }
      if (dadosPessoa.dataNascimento !== undefined) {
        beneficiario.pessoa.dataNascimento = dadosPessoa.dataNascimento;
        pessoaAlterada = true;
      }
      if (dadosPessoa.podeSairSozinho !== undefined) {
        beneficiario.pessoa.podeSairSozinho = dadosPessoa.podeSairSozinho;
        pessoaAlterada = true;
      }
      if (dadosPessoa.responsavelId !== undefined) {
        beneficiario.pessoa.responsavelId = dadosPessoa.responsavelId;
        pessoaAlterada = true;
      }

      if (pessoaAlterada) {
        await queryRunner.manager.save(beneficiario.pessoa);
      }

      if (dadosBeneficiario.familiaId !== undefined) {
        beneficiario.familiaId = dadosBeneficiario.familiaId;
      }
      if (dadosBeneficiario.nivelEscolaridade !== undefined) {
        beneficiario.nivelEscolaridade = dadosBeneficiario.nivelEscolaridade;
      }
      if (dadosBeneficiario.estadoCivil !== undefined) {
        beneficiario.estadoCivil = dadosBeneficiario.estadoCivil;
      }
      if (dadosBeneficiario.vinculoEmpregaticio !== undefined) {
        beneficiario.vinculoEmpregaticio =
          dadosBeneficiario.vinculoEmpregaticio;
      }
      if (dadosBeneficiario.quantidadeFilhos !== undefined) {
        beneficiario.quantidadeFilhos = dadosBeneficiario.quantidadeFilhos;
      }

      const beneficiarioAtualizado =
        await queryRunner.manager.save(beneficiario);

      await queryRunner.commitTransaction();

      return beneficiarioAtualizado;
    } catch (erro) {
      await queryRunner.rollbackTransaction();

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${JSON.stringify(erro)}`;

      this.logger.error(`Erro ao atualizar beneficiário: ${mensagemErro}`);

      // Tratamento para CPF duplicado durante a edição
      if (
        typeof erro === 'object' &&
        erro !== null &&
        'code' in erro &&
        (erro as Record<string, unknown>).code === '23505'
      ) {
        throw new ConflictException(
          'Já existe uma pessoa cadastrada com este CPF.',
        );
      }

      // Repassa NotFoundException caso venha de alguma validação interna
      if (erro instanceof NotFoundException) {
        throw erro;
      }

      throw new InternalServerErrorException(
        'Erro ao atualizar o beneficiário.',
      );
    } finally {
      // Libera o queryRunner
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
}
