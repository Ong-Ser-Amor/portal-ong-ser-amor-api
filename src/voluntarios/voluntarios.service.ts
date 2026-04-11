import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginacaoRespostaDto } from 'src/dtos/paginacao-resposta.dto';
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import { DataSource, EntityNotFoundError, Repository } from 'typeorm';

import { AtualizarVoluntarioDto } from './dto/atualizar-voluntario.dto';
import { CriarVoluntarioDto } from './dto/criar-voluntario.dto';
import { Voluntario } from './entities/voluntario.entity';

@Injectable()
export class VoluntariosService {
  private readonly logger = new Logger(VoluntariosService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Voluntario)
    private readonly repository: Repository<Voluntario>,
  ) {}

  async criar(criarVoluntarioDto: CriarVoluntarioDto): Promise<Voluntario> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const pessoa = new Pessoa({
        nome: criarVoluntarioDto.nome,
        cpf: criarVoluntarioDto.cpf,
        dataNascimento: criarVoluntarioDto.dataNascimento,
      });

      const pessoaSalva = await queryRunner.manager.save(pessoa);

      const voluntario = new Voluntario({
        pessoa: pessoaSalva,
        formacaoAcademica: criarVoluntarioDto.formacaoAcademica,
        statusFormacao: criarVoluntarioDto.statusFormacao,
        tipoVoluntario: criarVoluntarioDto.tipoVoluntario,
      });

      const voluntarioSalvo = await queryRunner.manager.save(voluntario);

      await queryRunner.commitTransaction();

      return voluntarioSalvo;
    } catch (erro: unknown) {
      await queryRunner.rollbackTransaction();

      // Log detalhado do erro para diagnóstico, sem expor detalhes sensíveis ao frontend
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${JSON.stringify(erro)}`;

      this.logger.error(`Erro ao criar voluntário: ${mensagemErro}`);

      // Verifica se o erro é uma violação de chave única (código 23505 no PostgreSQL)
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

      // Erro genérico para o frontend não ver detalhes sensíveis do banco
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
      const [voluntarios, total] = await Promise.all([
        this.repository.find({
          relations: ['pessoa'],
          take,
          skip,
        }),
        this.repository.count(),
      ]);

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
      // 3. Extraímos os dados que pertencem à Pessoa
      const { nome, cpf, dataNascimento, ...atualizacoesVoluntario } =
        atualizarVoluntarioDto;

      let pessoaAtualizada = false;

      if (nome !== undefined) {
        voluntario.pessoa.nome = nome;
        pessoaAtualizada = true;
      }
      if (cpf !== undefined) {
        voluntario.pessoa.cpf = cpf;
        pessoaAtualizada = true;
      }
      if (dataNascimento !== undefined) {
        voluntario.pessoa.dataNascimento = dataNascimento;
        pessoaAtualizada = true;
      }

      if (pessoaAtualizada) {
        await queryRunner.manager.save(voluntario.pessoa);
      }

      let voluntarioAtualizado: Voluntario | null = null;

      if (atualizacoesVoluntario.formacaoAcademica !== undefined) {
        voluntario.formacaoAcademica = atualizacoesVoluntario.formacaoAcademica;
      }
      if (atualizacoesVoluntario.statusFormacao !== undefined) {
        voluntario.statusFormacao = atualizacoesVoluntario.statusFormacao;
      }
      if (atualizacoesVoluntario.tipoVoluntario !== undefined) {
        voluntario.tipoVoluntario = atualizacoesVoluntario.tipoVoluntario;
      }

      voluntarioAtualizado = await queryRunner.manager.save(voluntario);

      await queryRunner.commitTransaction();

      return voluntarioAtualizado;
    } catch (erro: unknown) {
      await queryRunner.rollbackTransaction();

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${JSON.stringify(erro)}`;

      this.logger.error(`Erro ao atualizar voluntário: ${mensagemErro}`);

      // Se tentarem atualizar para um CPF que já existe em outra pessoa:
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

      throw new InternalServerErrorException('Erro ao atualizar voluntário.');
    } finally {
      await queryRunner.release();
    }
  }

  async remover(id: string): Promise<void> {
    await this.buscarPorId(id);

    try {
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
