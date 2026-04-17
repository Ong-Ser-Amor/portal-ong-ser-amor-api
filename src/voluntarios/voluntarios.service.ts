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

import { AtualizarVoluntarioDto } from './dto/atualizar-voluntario.dto';
import { CriarVoluntarioDto } from './dto/criar-voluntario.dto';
import { Voluntario } from './entities/voluntario.entity';

@Injectable()
export class VoluntariosService {
  private readonly logger = new Logger(VoluntariosService.name);

  constructor(
    @InjectRepository(Voluntario)
    private readonly repository: Repository<Voluntario>,
    private readonly pessoasService: PessoasService,
    private readonly dataSource: DataSource,
  ) {}

  async criar(criarVoluntarioDto: CriarVoluntarioDto): Promise<Voluntario> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let pessoaId = criarVoluntarioDto.pessoaId;

      if (!pessoaId) {
        // Cenario A: Id da pessoa não fornecido (pessoa não existe).

        const dadosPessoa: CriarPessoaDados = {
          nome: criarVoluntarioDto.nome,
          cpf: criarVoluntarioDto.cpf,
          dataNascimento: criarVoluntarioDto.dataNascimento,
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

      const voluntarioExistente = await queryRunner.manager.findOne(
        Voluntario,
        {
          where: { pessoaId },
        },
      );

      if (voluntarioExistente) {
        throw new ConflictException(
          'Esta pessoa já possui um cadastro de voluntário ativo.',
        );
      }

      const voluntario = new Voluntario({
        pessoaId,
        formacaoAcademica: criarVoluntarioDto.formacaoAcademica,
        statusFormacao: criarVoluntarioDto.statusFormacao,
        tipoVoluntario: criarVoluntarioDto.tipoVoluntario,
      });

      const voluntarioSalvo = await queryRunner.manager.save(voluntario);

      await queryRunner.commitTransaction();

      return voluntarioSalvo;
    } catch (erro: unknown) {
      await queryRunner.rollbackTransaction();

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${JSON.stringify(erro)}`;

      this.logger.error(`Erro ao criar voluntário: ${mensagemErro}`);

      if (
        erro instanceof ConflictException ||
        erro instanceof NotFoundException
      ) {
        throw erro;
      }

      throw new InternalServerErrorException('Erro ao criar voluntário.');
    } finally {
      await queryRunner.release();
    }
  }

  async buscarTodos(
    take = 10,
    skip = 0,
  ): Promise<PaginacaoRespostaDto<Voluntario>> {
    try {
      const [voluntarios, total] = await this.repository.findAndCount({
        relations: ['pessoa'],
        take,
        skip,
        order: { pessoa: { nome: 'ASC' } },
      });

      return new PaginacaoRespostaDto<Voluntario>(
        voluntarios,
        total,
        take,
        skip,
      );
    } catch (erro) {
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

      const dadosVoluntario = {
        formacaoAcademica: atualizarVoluntarioDto.formacaoAcademica,
        statusFormacao: atualizarVoluntarioDto.statusFormacao,
        tipoVoluntario: atualizarVoluntarioDto.tipoVoluntario,
      };

      let pessoaAtualizada = false;

      if (dadosPessoa.nome !== undefined) {
        voluntario.pessoa.nome = dadosPessoa.nome;
        pessoaAtualizada = true;
      }
      if (dadosPessoa.cpf !== undefined) {
        voluntario.pessoa.cpf = dadosPessoa.cpf;
        pessoaAtualizada = true;
      }
      if (dadosPessoa.dataNascimento !== undefined) {
        voluntario.pessoa.dataNascimento = dadosPessoa.dataNascimento;
        pessoaAtualizada = true;
      }

      if (pessoaAtualizada) {
        await queryRunner.manager.save(voluntario.pessoa);
      }

      if (dadosVoluntario.formacaoAcademica !== undefined) {
        voluntario.formacaoAcademica = dadosVoluntario.formacaoAcademica;
      }
      if (dadosVoluntario.statusFormacao !== undefined) {
        voluntario.statusFormacao = dadosVoluntario.statusFormacao;
      }
      if (dadosVoluntario.tipoVoluntario !== undefined) {
        voluntario.tipoVoluntario = dadosVoluntario.tipoVoluntario;
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

      if (erro instanceof NotFoundException) {
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
}
