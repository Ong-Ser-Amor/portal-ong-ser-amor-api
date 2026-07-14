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
import { ContatosService } from 'src/contatos/contatos.service';
import { CriarContatoDto } from 'src/contatos/dto/criar-contato.dto';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { FamiliasService } from 'src/familias/familias.service';
import { CriarPessoaDto } from 'src/pessoas/dto/criar-pessoa.dto';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { calcularIdade } from 'src/shared/utils/calculadora-idade';
import {
  DataSource,
  EntityManager,
  EntityNotFoundError,
  Repository,
} from 'typeorm';

import { AtualizarBeneficiarioDto } from './dto/atualizar-beneficiario.dto';
import { CriarBeneficiarioDto } from './dto/criar-beneficiario.dto';
import { TransferirFamiliaDto } from './dto/transferir-familia.dto';
import { Beneficiario } from './entities/beneficiario.entity';

@Injectable()
export class BeneficiariosService {
  private readonly logger = new Logger(BeneficiariosService.name);

  constructor(
    @InjectRepository(Beneficiario)
    private readonly repository: Repository<Beneficiario>,
    @Inject(forwardRef(() => PessoasService))
    private readonly pessoasService: PessoasService,
    @Inject(ContatosService)
    private readonly contatosService: ContatosService,
    @Inject(forwardRef(() => FamiliasService))
    private readonly familiasService: FamiliasService,
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
      let dataNascConsolidada = criarBeneficiarioDto.dataNascimento;
      let emancipadoConsolidado = criarBeneficiarioDto.emancipado;
      let responsavelConsolidado = criarBeneficiarioDto.responsavelId;

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

        const novaPessoa = await this.pessoasService.criar(
          dadosPessoa,
          queryRunner.manager,
        );
        pessoaId = novaPessoa.id;

        if (
          criarBeneficiarioDto.contatos &&
          criarBeneficiarioDto.contatos.length > 0
        ) {
          const contatosParaSalvar: CriarContatoDto[] =
            criarBeneficiarioDto.contatos.map((contato) => ({
              ...contato,
              pessoaId,
            }));
          await this.contatosService.criarVarios(
            contatosParaSalvar,
            queryRunner.manager,
          );
        }
      } else {
        // Cenario B: Pessoa já existe. Buscamos para ter a Data de Nascimento real!
        const pessoaExistente = await this.pessoasService.buscarPorId(
          pessoaId,
          queryRunner.manager,
        );

        // Consolida os dados para a validação
        dataNascConsolidada = pessoaExistente.dataNascimento;
        emancipadoConsolidado =
          criarBeneficiarioDto.emancipado ?? pessoaExistente.emancipado;
        responsavelConsolidado =
          criarBeneficiarioDto.responsavelId !== undefined
            ? criarBeneficiarioDto.responsavelId
            : pessoaExistente.responsavelId;
      }

      await this.validarRegrasMenoridade(
        dataNascConsolidada,
        emancipadoConsolidado,
        responsavelConsolidado,
        queryRunner.manager,
      );

      const beneficioExistente = await queryRunner.manager.findOne(
        Beneficiario,
        { where: { pessoaId } },
      );

      if (beneficioExistente) {
        throw new ConflictException(
          'Esta pessoa já possui um cadastro de beneficiário ativo.',
        );
      }

      let familiaIdFinal = criarBeneficiarioDto.familiaId;

      if (!familiaIdFinal && criarBeneficiarioDto.novaFamilia) {
        const familiaCriada = await this.familiasService.criar(
          criarBeneficiarioDto.novaFamilia,
          queryRunner.manager,
        );
        familiaIdFinal = familiaCriada.id;
      }

      const beneficiario = new Beneficiario({
        pessoaId,
        familiaId: familiaIdFinal,
        nivelEscolaridade: criarBeneficiarioDto.nivelEscolaridade,
        estadoCivil: criarBeneficiarioDto.estadoCivil,
        vinculoEmpregaticio: criarBeneficiarioDto.vinculoEmpregaticio,
        quantidadeFilhos: criarBeneficiarioDto.quantidadeFilhos,
      });

      const beneficiarioSalvo = await queryRunner.manager.save(beneficiario);

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

      if (
        erro instanceof NotFoundException ||
        erro instanceof ConflictException ||
        erro instanceof BadRequestException
      ) {
        throw erro;
      }

      throw new InternalServerErrorException('Erro ao criar o beneficiário.');
    } finally {
      await queryRunner.release();
    }
  }

  async buscarTodos(
    limite = 10,
    pagina = 1,
  ): Promise<PaginacaoRespostaDto<Beneficiario>> {
    try {
      const take = limite;
      const skip = (pagina - 1) * limite;

      const [beneficiarios, total] = await this.repository.findAndCount({
        relations: ['pessoa', 'familia'],
        take,
        skip,
        order: { pessoa: { nome: 'ASC' } },
      });

      return new PaginacaoRespostaDto<Beneficiario>(
        beneficiarios,
        total,
        limite,
        pagina,
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

  /**
   * Verifica de forma leve se um beneficiário existe no sistema pelo ID.
   * Lança NotFoundException se o registro não for encontrado.
   */
  async verificarExistenciaPorId(id: string): Promise<void> {
    try {
      const existe = await this.repository.existsBy({ id });

      if (!existe) {
        throw new NotFoundException(
          `Beneficiário com ID ${id} não encontrado.`,
        );
      }
    } catch (erro) {
      if (erro instanceof NotFoundException) {
        throw erro;
      }

      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro ao verificar existência do beneficiário: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao validar existência do beneficiário.',
      );
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

    await this.validarRegrasMenoridade(
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

      // Se vier algum dado de pessoa, a PessoasService atualiza na mesma transação
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

      // Atualiza os dados específicos do beneficiário
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

  async transferirFamilia(
    beneficiarioId: string,
    transferirFamiliaDto: TransferirFamiliaDto,
  ): Promise<Beneficiario> {
    const beneficiario = await this.buscarPorId(beneficiarioId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let novaFamiliaId = transferirFamiliaDto.familiaId;

      if (!novaFamiliaId && transferirFamiliaDto.novaFamilia) {
        // Cenario A: Criar uma nova familia e vincular o beneficiário a ela

        const familiaCriada = await this.familiasService.criar(
          transferirFamiliaDto.novaFamilia,
          queryRunner.manager,
        );
        novaFamiliaId = familiaCriada.id;
      } else if (novaFamiliaId) {
        // Cenario B: Vincular o beneficiário a uma familia existente (apenas atualiza o familiaId)
        await this.familiasService.buscarPorId(
          novaFamiliaId,
          queryRunner.manager,
        );
      }

      if (beneficiario.familiaId === novaFamiliaId) {
        throw new BadRequestException(
          'O beneficiário já pertence a esta família.',
        );
      }

      beneficiario.familiaId = novaFamiliaId;
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

      this.logger.error(
        `Erro ao transferir família do beneficiário: ${mensagemErro}`,
      );

      if (
        erro instanceof NotFoundException ||
        erro instanceof BadRequestException
      ) {
        throw erro;
      }

      throw new InternalServerErrorException(
        'Erro ao transferir família do beneficiário.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // =========================================================================
  // MÉTODOS PRIVADOS DE VALIDAÇÃO (REGRAS DE NEGÓCIO)
  // =========================================================================

  async existeBeneficiarioNaFamilia(
    familiaId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const beneficiarioRepo = manager
      ? manager.getRepository(Beneficiario)
      : this.repository;

    try {
      return await beneficiarioRepo.existsBy({ familiaId });
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;

      this.logger.error(
        `Erro ao verificar existência de beneficiário na família: ${mensagemErro}`,
      );

      throw new InternalServerErrorException(
        'Erro interno ao verificar beneficiários na família.',
      );
    }
  }

  /**
   * Valida se a pessoa atende aos requisitos legais de idade e emancipação.
   * Lança exceções (BadRequest) se as regras forem violadas.
   */
  private async validarRegrasMenoridade(
    dataNascimento: Date,
    emancipado?: boolean,
    responsavelId?: string | null,
    manager?: EntityManager,
  ): Promise<void> {
    const idade = calcularIdade(dataNascimento);

    if (idade < 18) {
      if (emancipado) {
        if (idade < 16) {
          throw new BadRequestException(
            'Apenas maiores de 16 anos podem ser emancipados.',
          );
        }
      } else {
        if (!responsavelId) {
          throw new BadRequestException(
            'O beneficiário é menor de idade e não é emancipado. É obrigatório informar o responsável (responsavelId) no cadastro da pessoa.',
          );
        }

        // Verifica no ContatosService se o responsável tem celular cadastrado,
        // para garantir um meio de contato em caso de emergências.
        const responsavelTemCelular =
          await this.contatosService.possuiCelularCadastrado(
            responsavelId,
            manager,
          );

        if (!responsavelTemCelular) {
          throw new BadRequestException(
            'O responsável selecionado não possui um telemóvel (CELULAR) registado. Cadastre o contato do responsável primeiro para garantir contacto em emergências.',
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
