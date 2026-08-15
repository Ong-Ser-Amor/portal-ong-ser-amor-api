import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BeneficiariosService } from 'src/beneficiarios/beneficiarios.service';
import { VoluntariosService } from 'src/voluntarios/voluntarios.service';
import { EntityManager, EntityNotFoundError, Repository } from 'typeorm';

import { AtualizarPessoaDto } from './dto/atualizar-pessoa.dto';
import { CriarPessoaDto } from './dto/criar-pessoa.dto';
import { Pessoa } from './entities/pessoa.entity';

@Injectable()
export class PessoasService {
  private readonly logger = new Logger(PessoasService.name);

  constructor(
    @InjectRepository(Pessoa)
    private readonly repository: Repository<Pessoa>,
    @Inject(forwardRef(() => VoluntariosService))
    private readonly voluntariosService: VoluntariosService,
    @Inject(forwardRef(() => BeneficiariosService))
    private readonly beneficiariosService: BeneficiariosService,
  ) { }

  async criar(
    criarPessoaDto: CriarPessoaDto,
    gerenciadorTransacao?: EntityManager,
  ): Promise<Pessoa> {
    try {
      const pessoa = new Pessoa({
        nome: criarPessoaDto.nome,
        cpf: criarPessoaDto.cpf,
        dataNascimento: criarPessoaDto.dataNascimento,
        podeSairSozinho: criarPessoaDto.podeSairSozinho,
        responsavelId: criarPessoaDto.responsavelId,
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

  async buscarPorCpf(cpf: string): Promise<Pessoa> {
    try {
      const pessoa = await this.repository.findOneBy({
        cpf,
      });

      if (!pessoa) {
        throw new NotFoundException(`Pessoa com CPF ${cpf} não encontrada.`);
      }

      return pessoa;
    } catch (erro) {
      if (erro instanceof NotFoundException) {
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

  async atualizar(
    id: string,
    atualizarPessoaDto: AtualizarPessoaDto,
    gerenciadorTransacao?: EntityManager,
  ): Promise<Pessoa> {
    const manager = gerenciadorTransacao || this.repository.manager;

    try {
      const pessoa = await this.buscarPorId(id, manager);

      let houveAlteracao = false;

      // Verificamos o que veio no DTO
      if (
        atualizarPessoaDto.nome !== undefined &&
        atualizarPessoaDto.nome !== pessoa.nome
      ) {
        pessoa.nome = atualizarPessoaDto.nome;
        houveAlteracao = true;
      }
      if (
        atualizarPessoaDto.cpf !== undefined &&
        atualizarPessoaDto.cpf !== pessoa.cpf
      ) {
        pessoa.cpf = atualizarPessoaDto.cpf;
        houveAlteracao = true;
      }
      if (
        atualizarPessoaDto.dataNascimento !== undefined &&
        atualizarPessoaDto.dataNascimento !== pessoa.dataNascimento
      ) {
        pessoa.dataNascimento = atualizarPessoaDto.dataNascimento;
        houveAlteracao = true;
      }
      if (
        atualizarPessoaDto.podeSairSozinho !== undefined &&
        atualizarPessoaDto.podeSairSozinho !== pessoa.podeSairSozinho
      ) {
        pessoa.podeSairSozinho = atualizarPessoaDto.podeSairSozinho;
        houveAlteracao = true;
      }
      if (
        atualizarPessoaDto.responsavelId !== undefined &&
        atualizarPessoaDto.responsavelId !== pessoa.responsavelId
      ) {
        pessoa.responsavelId = atualizarPessoaDto.responsavelId;
        houveAlteracao = true;
      }
      if (
        atualizarPessoaDto.emancipado !== undefined &&
        atualizarPessoaDto.emancipado !== pessoa.emancipado
      ) {
        pessoa.emancipado = atualizarPessoaDto.emancipado;
        houveAlteracao = true;
      }

      if (!houveAlteracao) {
        return pessoa;
      }

      return await manager.save(pessoa);
    } catch (erro: any) {
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

      // Se for NotFoundException (vindo do buscarPorId) ou outro erro, sobe para quem chamou
      throw erro;
    }
  }

  async verificarCadastroBeneficiarioPorCpf(cpf: string): Promise<Pessoa> {
    try {
      const pessoa = await this.buscarPorCpf(cpf);

      const beneficiarioExistente =
        await this.beneficiariosService.verificarExistenciaPorPessoaId(
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
        `Erro inesperado ao buscar pessoa por CPF: ${mensagemErro}`,
      );

      throw new InternalServerErrorException(
        'Erro interno ao buscar a pessoa.',
      );
    }
  }

  async verificarCadastroVoluntarioPorCpf(cpf: string): Promise<Pessoa> {
    try {
      const pessoa = await this.buscarPorCpf(cpf);

      const voluntarioExistente =
        await this.voluntariosService.verificarExistenciaPorPessoaId(pessoa.id);

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
}
