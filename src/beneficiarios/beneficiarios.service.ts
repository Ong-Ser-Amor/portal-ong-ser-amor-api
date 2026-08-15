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
import { ContatoValidadorInput } from 'src/contatos/utils/validar-regras-contatos.util';
import { FamiliasService } from 'src/familias/familias.service';
import { AtualizarPessoaDto } from 'src/pessoas/dto/atualizar-pessoa.dto';
import { CriarPessoaDto } from 'src/pessoas/dto/criar-pessoa.dto';
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { calcularIdade } from 'src/shared/utils/calculadora-idade';
import {
  DataSource,
  EntityManager,
  EntityNotFoundError,
  FindOptionsWhere,
  ILike,
  Not,
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
  ) { }

  async criar(
    criarBeneficiarioDto: CriarBeneficiarioDto,
  ): Promise<Beneficiario> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let pessoa: Pessoa;

      if (!criarBeneficiarioDto.pessoaId) {
        // Cenario A: Id da pessoa não fornecido (pessoa não existe).
        const dadosPessoa: CriarPessoaDto = {
          nome: criarBeneficiarioDto.nome,
          cpf: criarBeneficiarioDto.cpf,
          dataNascimento: criarBeneficiarioDto.dataNascimento,
          podeSairSozinho: criarBeneficiarioDto.podeSairSozinho,
          responsavelId: criarBeneficiarioDto.responsavelId,
          emancipado: criarBeneficiarioDto.emancipado,
        };

        pessoa = await this.pessoasService.criar(
          dadosPessoa,
          queryRunner.manager,
        );
      } else {
        // Cenario B: Id da pessoa fornecido (pessoa já existe).
        pessoa = await this.pessoasService.buscarPorId(
          criarBeneficiarioDto.pessoaId,
          queryRunner.manager,
        );
      }

      if (
        criarBeneficiarioDto.contatos &&
        criarBeneficiarioDto.contatos.length > 0
      ) {
        const contatosParaSalvar: CriarContatoDto[] =
          criarBeneficiarioDto.contatos.map((contato) => ({
            ...contato,
            pessoaId: pessoa.id,
          }));
        await this.contatosService.criarVarios(
          contatosParaSalvar,
          queryRunner.manager,
        );
      }

      await this.validarRegrasMenoridade(
        pessoa.dataNascimento,
        pessoa.emancipado,
        pessoa.responsavelId,
        pessoa.podeSairSozinho,
        pessoa.id,
        criarBeneficiarioDto.contatos,
        queryRunner.manager,
        !criarBeneficiarioDto.pessoaId,
      );

      const beneficioExistente = await queryRunner.manager.findOne(
        Beneficiario,
        { where: { pessoaId: pessoa.id } },
      );

      if (beneficioExistente) {
        throw new ConflictException(
          'Esta pessoa já possui um cadastro de beneficiário ativo.',
        );
      }

      let familiaIdFinal = criarBeneficiarioDto.familiaId;

      if (familiaIdFinal) {
        await this.familiasService.buscarPorId(
          familiaIdFinal,
          queryRunner.manager,
        );
      } else if (criarBeneficiarioDto.novaFamilia) {
        const familiaCriada = await this.familiasService.criar(
          criarBeneficiarioDto.novaFamilia,
          queryRunner.manager,
        );
        familiaIdFinal = familiaCriada.id;
      }

      const beneficiario = new Beneficiario({
        pessoaId: pessoa.id,
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
          relations: ['pessoa', 'familia', 'familia.endereco'],
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
    pagina = 1,
    itensPorPagina = 10,
    nome?: string,
    cpf?: string,
    familiaId?: string,
    ignorarId?: string,
  ): Promise<PaginacaoRespostaDto<Beneficiario>> {
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

      const whereClause: FindOptionsWhere<Beneficiario> = {};

      if (ignorarId) {
        whereClause.id = Not(ignorarId);
      }

      if (familiaId) {
        whereClause.familiaId = familiaId;
      }

      if (cpf && !/^\d{11}$/.test(cpf)) {
        throw new BadRequestException(
          'A busca por CPF deve conter apenas 11 dígitos numéricos.',
        );
      }

      if (nome || cpf) {
        whereClause.pessoa = {};
        if (nome) {
          whereClause.pessoa.nome = ILike(`%${nome.trim()}%`);
        }
        if (cpf) {
          whereClause.pessoa.cpf = cpf;
        }
      }

      const [beneficiarios, total] = await this.repository.findAndCount({
        where: whereClause,
        relations: ['pessoa'],
        take,
        skip,
        order: { pessoa: { nome: 'ASC' } },
      });

      return new PaginacaoRespostaDto<Beneficiario>(
        beneficiarios,
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

      this.logger.error(`Erro ao buscar beneficiários: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao buscar beneficiários.');
    }
  }

  async buscarPorId(id: string): Promise<Beneficiario> {
    try {
      return await this.repository.findOneOrFail({
        where: { id },
        relations: [
          'pessoa',
          'pessoa.contatos',
          'pessoa.contatos.contato',
          'familia',
          'familia.endereco',
        ],
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

    const idadeConsolidada = calcularIdade(dataNascConsolidada);
    const ehAdultoOuEmancipadoConsolidado =
      idadeConsolidada >= 18 || Boolean(emancipadoConsolidado);

    const podeSairSozinhoConsolidado =
      atualizarBeneficiarioDto.podeSairSozinho !== undefined
        ? atualizarBeneficiarioDto.podeSairSozinho
        : ehAdultoOuEmancipadoConsolidado
          ? null
          : beneficiarioAtual.pessoa.podeSairSozinho;

    await this.validarRegrasMenoridade(
      dataNascConsolidada,
      emancipadoConsolidado,
      responsavelConsolidado,
      podeSairSozinhoConsolidado,
      beneficiarioAtual.pessoa.id,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dadosPessoa: AtualizarPessoaDto = {
        nome: atualizarBeneficiarioDto.nome,
        cpf: atualizarBeneficiarioDto.cpf,
        dataNascimento: atualizarBeneficiarioDto.dataNascimento,
        responsavelId: atualizarBeneficiarioDto.responsavelId,
        emancipado: atualizarBeneficiarioDto.emancipado,
      };

      if (ehAdultoOuEmancipadoConsolidado) {
        dadosPessoa.podeSairSozinho = null;
      } else if (atualizarBeneficiarioDto.podeSairSozinho !== undefined) {
        dadosPessoa.podeSairSozinho = atualizarBeneficiarioDto.podeSairSozinho;
      }

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
   * Valida se a pessoa atende aos requisitos legais de idade, emancipação e obrigatoriedade de contatos.
   * Lança exceções (BadRequest) se as regras forem violadas.
   */
  private async validarRegrasMenoridade(
    dataNascimento: Date,
    emancipado?: boolean,
    responsavelId?: string | null,
    podeSairSozinhoInput?: boolean | null,
    pessoaId?: string,
    contatosDto?: ContatoValidadorInput[],
    manager?: EntityManager,
    isNovaPessoa = false,
  ): Promise<void> {
    const idade = calcularIdade(dataNascimento);

    if (idade < 16 && emancipado) {
      throw new BadRequestException(
        'Apenas maiores de 16 anos podem ser emancipados.',
      );
    }

    const ehAdultoOuEmancipado = idade >= 18 || Boolean(emancipado);

    if (ehAdultoOuEmancipado) {
      if (podeSairSozinhoInput !== undefined && podeSairSozinhoInput !== null) {
        throw new BadRequestException(
          'O campo podeSairSozinho é exclusivo para menores de idade não emancipados.',
        );
      }

      const possuiContatosNoDto = Boolean(
        contatosDto && contatosDto.length > 0,
      );

      if (!possuiContatosNoDto) {
        let possuiContatosSalvos = false;
        if (!isNovaPessoa && pessoaId) {
          const contatosExistentes =
            await this.contatosService.buscarPorPessoaId(pessoaId, manager);
          possuiContatosSalvos = contatosExistentes.length > 0;
        }

        if (!possuiContatosSalvos) {
          throw new BadRequestException(
            'O cadastro de contatos é obrigatório para beneficiários adultos ou menores emancipados.',
          );
        }
      }
    } else {
      if (podeSairSozinhoInput === undefined || podeSairSozinhoInput === null) {
        throw new BadRequestException(
          'O campo podeSairSozinho é obrigatório para menores de idade não emancipados.',
        );
      }

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

  async verificarCadastroPorCpf(cpf: string): Promise<Pessoa> {
    try {
      const pessoa = await this.pessoasService.buscarPorCpf(cpf);

      const beneficiarioExistente = await this.verificarExistenciaPorPessoaId(
        pessoa.id,
      );

      if (beneficiarioExistente) {
        throw new ConflictException(
          'Esta pessoa já possui um cadastro de beneficiário ativo.',
        );
      }

      return pessoa;
    } catch (erro) {
      if (
        erro instanceof NotFoundException ||
        erro instanceof ConflictException
      ) {
        throw erro;
      }

      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro inesperado ao buscar pessoa por CPF no módulo de beneficiários: ${mensagemErro}`,
      );

      throw new InternalServerErrorException(
        'Erro interno ao buscar a pessoa.',
      );
    }
  }
}
