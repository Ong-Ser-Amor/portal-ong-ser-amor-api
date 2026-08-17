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
import { CriarPessoaDto } from 'src/pessoas/dto/criar-pessoa.dto';
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import {
  DataSource,
  EntityNotFoundError,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';

import { AtualizarVoluntarioDto } from './dto/atualizar-voluntario.dto';
import { CriarVoluntarioDto } from './dto/criar-voluntario.dto';
import { Voluntario } from './entities/voluntario.entity';

@Injectable()
export class VoluntariosService {
  private readonly logger = new Logger(VoluntariosService.name);

  constructor(
    @InjectRepository(Voluntario)
    private readonly repository: Repository<Voluntario>,
    @Inject(forwardRef(() => PessoasService))
    private readonly pessoasService: PessoasService,
    private readonly dataSource: DataSource,
  ) {}

  async criar(criarVoluntarioDto: CriarVoluntarioDto): Promise<Voluntario> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let pessoa: Pessoa;

      if (!criarVoluntarioDto.pessoaId) {
        // Cenario A: Id da pessoa não fornecido (pessoa não existe).

        const dadosPessoa: CriarPessoaDto = {
          nome: criarVoluntarioDto.nome,
          cpf: criarVoluntarioDto.cpf,
          dataNascimento: criarVoluntarioDto.dataNascimento,
        };

        // Passa o queryRunner.manager para garantir que a pessoa será criada na mesma transação
        pessoa = await this.pessoasService.criar(
          dadosPessoa,
          queryRunner.manager,
        );
      } else {
        // Cenario B: Id da pessoa fornecido (pessoa já existe).

        pessoa = await this.pessoasService.buscarPorId(
          criarVoluntarioDto.pessoaId,
          queryRunner.manager,
          true,
        );

        if (pessoa.deletadoEm) {
          pessoa = await this.pessoasService.restaurar(
            pessoa.id,
            queryRunner.manager,
          );
        }
      }

      const voluntarioExistente = await queryRunner.manager.findOne(
        Voluntario,
        {
          where: { pessoaId: pessoa.id },
        },
      );

      if (voluntarioExistente) {
        throw new ConflictException(
          'Esta pessoa já possui um cadastro de voluntário ativo.',
        );
      }

      const voluntario = new Voluntario({
        pessoaId: pessoa.id,
        formacaoAcademica: criarVoluntarioDto.formacaoAcademica,
        statusFormacao: criarVoluntarioDto.statusFormacao,
        tipoVoluntario: criarVoluntarioDto.tipoVoluntario,
      });

      const voluntarioSalvo = await queryRunner.manager.save(voluntario);

      // Carrega a relação com Pessoa DENTRO da transação antes de fazer commit
      const voluntarioComPessoa = await queryRunner.manager.findOneOrFail(
        Voluntario,
        {
          where: { id: voluntarioSalvo.id },
          relations: ['pessoa'],
        },
      );

      await queryRunner.commitTransaction();

      return voluntarioComPessoa;
    } catch (erro: unknown) {
      await queryRunner.rollbackTransaction();

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${JSON.stringify(erro)}`;

      this.logger.error(`Erro ao criar voluntário: ${mensagemErro}`);

      if (
        erro instanceof NotFoundException ||
        erro instanceof ConflictException ||
        erro instanceof BadRequestException
      ) {
        throw erro;
      }

      throw new InternalServerErrorException('Erro ao criar voluntário.');
    } finally {
      await queryRunner.release();
    }
  }

  async buscarTodos(
    pagina = 1,
    itensPorPagina = 10,
    nome?: string,
  ): Promise<PaginacaoRespostaDto<Voluntario>> {
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

      const whereClause: FindOptionsWhere<Voluntario> = {};

      if (nome) {
        whereClause.pessoa = {
          nome: ILike(`%${nome.trim()}%`),
        };
      }

      const [voluntarios, total] = await this.repository.findAndCount({
        where: whereClause,
        relations: ['pessoa'],
        take,
        skip,
        order: { pessoa: { nome: 'ASC' } },
      });

      return new PaginacaoRespostaDto<Voluntario>(
        voluntarios,
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
      this.logger.error(`Erro ao buscar voluntários: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao buscar voluntários.');
    }
  }

  async buscarPorId(id: string): Promise<Voluntario> {
    try {
      return await this.repository.findOneOrFail({
        where: { id },
        relations: ['pessoa'],
      });
    } catch (erro) {
      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(`Voluntário com ID ${id} não encontrado.`);
      }

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;

      this.logger.error(`Erro ao buscar voluntário: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao buscar voluntário.');
    }
  }

  async atualizar(
    id: string,
    atualizarVoluntarioDto: AtualizarVoluntarioDto,
  ): Promise<Voluntario> {
    const voluntario = await this.buscarPorId(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const dadosPessoa = {
        nome: atualizarVoluntarioDto.nome,
        cpf: atualizarVoluntarioDto.cpf,
        dataNascimento: atualizarVoluntarioDto.dataNascimento,
      };

      // 1. DELEGAÇÃO: Se veio algum dado de pessoa, a PessoasService atualizar na mesma transação
      if (
        dadosPessoa.nome !== undefined ||
        dadosPessoa.cpf !== undefined ||
        dadosPessoa.dataNascimento !== undefined
      ) {
        const pessoaAtualizada = await this.pessoasService.atualizar(
          voluntario.pessoa.id,
          dadosPessoa,
          queryRunner.manager,
        );

        // Substitui a referência em memória pela pessoa atualizada
        voluntario.pessoa = pessoaAtualizada;
      }

      // 2. ATUALIZA OS DADOS ESPECÍFICOS DO VOLUNTÁRIO
      if (atualizarVoluntarioDto.formacaoAcademica !== undefined) {
        voluntario.formacaoAcademica = atualizarVoluntarioDto.formacaoAcademica;
      }
      if (atualizarVoluntarioDto.statusFormacao !== undefined) {
        voluntario.statusFormacao = atualizarVoluntarioDto.statusFormacao;
      }
      if (atualizarVoluntarioDto.tipoVoluntario !== undefined) {
        voluntario.tipoVoluntario = atualizarVoluntarioDto.tipoVoluntario;
      }

      const voluntarioAtualizado = await queryRunner.manager.save(voluntario);

      await queryRunner.commitTransaction();

      return voluntarioAtualizado;
    } catch (erro: unknown) {
      await queryRunner.rollbackTransaction();

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${JSON.stringify(erro)}`;

      this.logger.error(`Erro ao atualizar voluntário: ${mensagemErro}`);

      if (
        erro instanceof ConflictException ||
        erro instanceof NotFoundException
      ) {
        throw erro;
      }

      throw new InternalServerErrorException('Erro ao atualizar voluntário.');
    } finally {
      await queryRunner.release();
    }
  }

  async remover(id: string): Promise<void> {
    await this.buscarPorId(id);

    try {
      // Realiza o Soft Delete apenas na tabela de voluntários
      // A tabela 'pessoas' permanece intacta neste momento.
      // A limpeza de pessoas órfãs (sem papéis) é feita por uma Cron Job
      await this.repository.softDelete(id);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;

      this.logger.error(`Erro ao remover voluntário: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao remover voluntário.');
    }
  }

  async verificarExistenciaPorPessoaId(pessoaId: string): Promise<boolean> {
    try {
      return await this.repository.exists({ where: { pessoaId } });
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;

      this.logger.error(
        `Erro ao verificar existência de voluntário por pessoa ID: ${mensagemErro}`,
      );

      throw new InternalServerErrorException(
        'Erro interno ao verificar o vínculo de voluntário.',
      );
    }
  }

  async verificarCadastroPorCpf(cpf: string): Promise<Pessoa> {
    try {
      const pessoa = await this.pessoasService.buscarPorCpf(
        cpf,
        undefined,
        true,
      );

      const voluntarioExistente = await this.verificarExistenciaPorPessoaId(
        pessoa.id,
      );

      if (voluntarioExistente) {
        throw new ConflictException(
          'Esta pessoa já possui um cadastro de voluntário ativo.',
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
        `Erro inesperado ao buscar pessoa por CPF no módulo de voluntários: ${mensagemErro}`,
      );

      throw new InternalServerErrorException(
        'Erro interno ao buscar a pessoa.',
      );
    }
  }
}
