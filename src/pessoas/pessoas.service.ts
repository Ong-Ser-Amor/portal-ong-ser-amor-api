import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Voluntario } from 'src/voluntarios/entities/voluntario.entity';
import { EntityManager, EntityNotFoundError, Repository } from 'typeorm';

import { Pessoa } from './entities/pessoa.entity';
import { CriarPessoaDados } from './interfaces/criar-pessoa-dados.interface';

@Injectable()
export class PessoasService {
  private readonly logger = new Logger(PessoasService.name);

  constructor(
    @InjectRepository(Pessoa)
    private readonly repository: Repository<Pessoa>,
    @InjectRepository(Voluntario)
    private readonly voluntarioRepository: Repository<Voluntario>,
  ) {}

  async criar(
    dadosPessoa: CriarPessoaDados,
    gerenciadorTransacao?: EntityManager,
  ): Promise<Pessoa> {
    try {
      const pessoa = new Pessoa({
        nome: dadosPessoa.nome,
        cpf: dadosPessoa.cpf,
        dataNascimento: dadosPessoa.dataNascimento,
        podeSairSozinho: dadosPessoa.podeSairSozinho,
        responsavelId: dadosPessoa.responsavelId,
      });

      // Se uma transação foi passada por quem chamou, salva DENTRO da transação
      if (gerenciadorTransacao) {
        return await gerenciadorTransacao.save(pessoa);
      }

      // Se não, salva direto no repositório padrão (operação isolada)
      return await this.repository.save(pessoa);
    } catch (erro: any) {
      // Trata erro de CPF duplicado (Unique Constraint do Postgres)
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

      // Se for outro erro de banco, repassa para cima para quem chamou resolver
      throw erro;
    }
  }

  async buscarPorId(
    id: string,
    gerenciadorTransacao?: EntityManager,
  ): Promise<Pessoa> {
    try {
      const manager = gerenciadorTransacao || this.repository.manager;

      return await manager.findOneOrFail(Pessoa, {
        where: { id },
      });
    } catch (erro) {
      // Traduz o erro do TypeORM para o erro 404 do NestJS
      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(
          `Pessoa com ID ${id} não encontrada no sistema.`,
        );
      }

      const mensagemErro = erro instanceof Error ? erro.message : String(erro);
      this.logger.error(
        `Erro inesperado ao buscar pessoa por ID: ${mensagemErro}`,
      );

      throw new InternalServerErrorException(
        'Erro interno ao buscar a pessoa.',
      );
    }
  }

  async verificarCadastroVoluntarioPorCpf(cpf: string): Promise<Pessoa> {
    try {
      const pessoa = await this.repository.findOne({
        where: { cpf },
      });

      if (!pessoa) {
        throw new NotFoundException(`Pessoa com CPF ${cpf} não encontrada.`);
      }

      const voluntarioExistente = await this.voluntarioRepository.findOne({
        where: { pessoaId: pessoa.id },
      });

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
        `Erro inesperado ao buscar pessoa por CPF: ${mensagemErro}`,
      );

      throw new InternalServerErrorException(
        'Erro interno ao buscar a pessoa.',
      );
    }
  }

  async buscarPorCpf(cpf: string): Promise<Pessoa> {
    return this.verificarCadastroVoluntarioPorCpf(cpf);
  }
}
