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
import { PessoaContato } from 'src/pessoas/entities/pessoa-contato.entity';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { EntityManager, EntityNotFoundError, Repository } from 'typeorm';

import { AtualizarContatoDto } from './dto/atualizar-contato.dto';
import { CriarContatoDto } from './dto/criar-contato.dto';
import { Contato } from './entities/contato.entity';
import { TipoContato } from './enums/tipo-contato.enum';

@Injectable()
export class ContatosService {
  private readonly logger = new Logger(ContatosService.name);

  constructor(
    @InjectRepository(Contato)
    private readonly repository: Repository<Contato>,
    @InjectRepository(PessoaContato)
    private readonly pessoaContatoRepository: Repository<PessoaContato>,
    @Inject(forwardRef(() => PessoasService))
    private readonly pessoasService: PessoasService,
  ) {}

  async criar(
    criarContatoDto: CriarContatoDto,
    manager?: EntityManager,
  ): Promise<Contato> {
    const contatoRepository = manager
      ? manager.getRepository(Contato)
      : this.repository;
    const pcRepository = manager
      ? manager.getRepository(PessoaContato)
      : this.pessoaContatoRepository;

    await this.pessoasService.buscarPorId(criarContatoDto.pessoaId, manager);

    const contatoExistente = await this.verificarDuplicidade(
      criarContatoDto.pessoaId,
      criarContatoDto.tipoContato,
      criarContatoDto.valor,
      undefined,
      manager,
    );

    if (contatoExistente) {
      throw new ConflictException(
        `O contato '${criarContatoDto.valor}' já está registado para esta pessoa.`,
      );
    }

    try {
      const contato = contatoRepository.create({
        tipoContato: criarContatoDto.tipoContato,
        valor: criarContatoDto.valor,
      });

      const contatoSalvo = await contatoRepository.save(contato);

      // Cria o vínculo na tabela intermediária PessoaContato
      const vinculo = pcRepository.create({
        pessoaId: criarContatoDto.pessoaId,
        contatoId: contatoSalvo.id,
      });
      await pcRepository.save(vinculo);

      return contatoSalvo;
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error ? erro.message : 'Erro desconhecido';
      this.logger.error(`Erro ao criar contato: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao criar contato.');
    }
  }

  /**
   * Cria múltiplos contatos de uma vez (ideal para cadastros unificados em transações)
   */
  async criarVarios(
    contatos: CriarContatoDto[],
    manager?: EntityManager,
  ): Promise<Contato[]> {
    try {
      // Usa Promise.all para executar a criação (e as validações de duplicidade)
      // de todos os contatos simultaneamente (em paralelo), otimizando a performance.
      return await Promise.all(
        contatos.map((contatoDto) => this.criar(contatoDto, manager)),
      );
    } catch (erro) {
      this.logger.error(
        `Erro ao criar múltiplos contatos: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
      // Se um falhar (ex: duplicidade), a Promise.all rejeita e o erro sobe,
      // o que acionará o rollback na transação do BeneficiáriosService.
      throw erro;
    }
  }

  async buscarPorId(id: string): Promise<Contato> {
    try {
      return await this.repository.findOneOrFail({
        where: { id },
      });
    } catch (erro) {
      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(`Contato não encontrado.`);
      }

      const mensagemErro =
        erro instanceof Error ? erro.message : 'Erro desconhecido';
      this.logger.error(`Erro ao buscar contato: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao buscar contato.');
    }
  }

  async buscarPorPessoaId(pessoaId: string): Promise<Contato[]> {
    await this.pessoasService.buscarPorId(pessoaId);
    try {
      const pessoasContatos = await this.pessoaContatoRepository.find({
        where: { pessoaId },
        relations: { contato: true },
      });

      return pessoasContatos
        .map((pc) => pc.contato)
        .filter((contato): contato is Contato => Boolean(contato));
    } catch (erro) {
      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(`Pessoa não encontrada.`);
      }

      const mensagemErro =
        erro instanceof Error ? erro.message : 'Erro desconhecido';
      this.logger.error(
        `Erro ao buscar contatos para pessoa ${pessoaId}: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao buscar contatos para a pessoa.',
      );
    }
  }

  async atualizar(
    id: string,
    atualizarContatoDto: AtualizarContatoDto,
    manager?: EntityManager,
  ): Promise<Contato> {
    const contatoRepo = manager
      ? manager.getRepository(Contato)
      : this.repository;

    const contatoAtual = await this.buscarPorId(id);

    // Como atualizarContatoDto usa OmitType(..., ['pessoaId']), não temos como ler o pessoaId dele.
    // Precisamos buscar de quem é este contato através da tabela intermediária.
    const vinculo = await this.pessoaContatoRepository.findOne({
      where: { contatoId: id },
    });

    if (!vinculo) {
      throw new InternalServerErrorException(
        'Vínculo de contato não encontrado.',
      );
    }

    const tipoConsolidado =
      atualizarContatoDto.tipoContato ?? contatoAtual.tipoContato;
    const valorConsolidado = atualizarContatoDto.valor ?? contatoAtual.valor;

    if (atualizarContatoDto.tipoContato || atualizarContatoDto.valor) {
      const existeDuplicidade = await this.verificarDuplicidade(
        vinculo.pessoaId,
        tipoConsolidado,
        valorConsolidado,
        id, // Ignora o ID atual para permitir update
        manager,
      );

      if (existeDuplicidade) {
        throw new ConflictException(
          'Já existe um contato com estes dados para esta pessoa.',
        );
      }
    }

    try {
      contatoRepo.merge(contatoAtual, atualizarContatoDto);
      return await contatoRepo.save(contatoAtual);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error ? erro.message : 'Erro desconhecido';
      this.logger.error(`Erro ao atualizar contato: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao atualizar contato.');
    }
  }

  async remover(id: string): Promise<void> {
    await this.buscarPorId(id);

    try {
      await this.pessoaContatoRepository.softDelete({ contatoId: id });
      await this.repository.softDelete(id);
    } catch (erro) {
      if (erro instanceof NotFoundException) {
        throw erro;
      }

      const mensagemErro =
        erro instanceof Error ? erro.message : 'Erro desconhecido';
      this.logger.error(`Erro ao remover contato: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao remover contato.');
    }
  }

  // =========================================================================
  // MÉTODOS AUXILIARES E DE VALIDAÇÃO
  // =========================================================================

  /**
   * Verifica se um contato já existe para evitar duplicidades na mesma pessoa.
   * Recebe um EntityManager opcional para rodar dentro de transações.
   */
  async verificarDuplicidade(
    pessoaId: string,
    tipoContato: TipoContato,
    valor: string,
    contatoIgnoradoId?: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const pcRepository = manager
      ? manager.getRepository(PessoaContato)
      : this.pessoaContatoRepository;

    const query = pcRepository
      .createQueryBuilder('pc')
      .innerJoin('pc.contato', 'contato')
      .where('pc.pessoaId = :pessoaId', { pessoaId })
      .andWhere('contato.tipoContato = :tipoContato', { tipoContato })
      .andWhere('contato.valor = :valor', { valor });

    if (contatoIgnoradoId) {
      query.andWhere('contato.id != :contatoIgnoradoId', { contatoIgnoradoId });
    }

    return await query.getExists();
  }

  /**
   * Valida se a pessoa tem algum contato do tipo CELULAR.
   * Essencial para a regra de negócio do BeneficiariosService.
   */
  async possuiCelularCadastrado(
    pessoaId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const pcRepository = manager
      ? manager.getRepository(PessoaContato)
      : this.pessoaContatoRepository;

    return await pcRepository.existsBy({
      pessoaId,
      contato: { tipoContato: TipoContato.CELULAR },
    });
  }
}
