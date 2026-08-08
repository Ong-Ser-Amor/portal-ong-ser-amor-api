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
import { PessoaContato } from 'src/pessoas/entities/pessoa-contato.entity';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { EntityManager, EntityNotFoundError, Repository } from 'typeorm';

import { AtualizarContatoDto } from './dto/atualizar-contato.dto';
import { CriarContatoDto } from './dto/criar-contato.dto';
import { Contato } from './entities/contato.entity';
import { TipoContato } from './enums/tipo-contato.enum';
import { validarRegrasContatos } from './utils/validar-regras-contatos.util';

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
    pularValidacaoRegras = false,
  ): Promise<Contato> {
    const contatoRepository = manager
      ? manager.getRepository(Contato)
      : this.repository;
    const pcRepository = manager
      ? manager.getRepository(PessoaContato)
      : this.pessoaContatoRepository;

    await this.pessoasService.buscarPorId(criarContatoDto.pessoaId, manager);

    if (!pularValidacaoRegras) {
      const contatosExistentes = await pcRepository.find({
        where: { pessoaId: criarContatoDto.pessoaId },
        relations: { contato: true },
      });

      const contatosConsolidados = [
        ...contatosExistentes
          .filter((pc) => Boolean(pc.contato))
          .map((pc) => ({
            tipoContato: pc.contato.tipoContato,
            ehPrincipal: pc.ehPrincipal,
          })),
        {
          tipoContato: criarContatoDto.tipoContato,
          ehPrincipal: criarContatoDto.ehPrincipal ?? false,
        },
      ];

      validarRegrasContatos(contatosConsolidados);
    }

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
      if (criarContatoDto.ehPrincipal) {
        await pcRepository.update(
          { pessoaId: criarContatoDto.pessoaId },
          { ehPrincipal: false },
        );
      }

      const contato = contatoRepository.create({
        tipoContato: criarContatoDto.tipoContato,
        valor: criarContatoDto.valor,
      });

      const contatoSalvo = await contatoRepository.save(contato);

      // Cria o vínculo na tabela intermediária PessoaContato
      const vinculo = pcRepository.create({
        pessoaId: criarContatoDto.pessoaId,
        contatoId: contatoSalvo.id,
        ehPrincipal: criarContatoDto.ehPrincipal ?? false,
      });
      await pcRepository.save(vinculo);

      return contatoSalvo;
    } catch (erro) {
      if (erro instanceof BadRequestException || erro instanceof ConflictException) {
        throw erro;
      }
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
    validarRegrasContatos(contatos);

    try {
      return await Promise.all(
        contatos.map((contatoDto) => this.criar(contatoDto, manager, true)),
      );
    } catch (erro) {
      this.logger.error(
        `Erro ao criar múltiplos contatos: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
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

  async buscarPorPessoaId(
    pessoaId: string,
    manager?: EntityManager,
  ): Promise<Contato[]> {
    const pcRepo = manager
      ? manager.getRepository(PessoaContato)
      : this.pessoaContatoRepository;

    await this.pessoasService.buscarPorId(pessoaId, manager);
    try {
      const pessoasContatos = await pcRepo.find({
        where: { pessoaId },
        relations: { contato: true },
      });

      return pessoasContatos
        .filter((pc): pc is PessoaContato & { contato: Contato } => Boolean(pc.contato))
        .map((pc) => Object.assign(pc.contato, { ehPrincipal: pc.ehPrincipal }));
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
    const pcRepo = manager
      ? manager.getRepository(PessoaContato)
      : this.pessoaContatoRepository;

    const contatoAtual = await this.buscarPorId(id);

    const vinculo = await pcRepo.findOne({
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
    const ehPrincipalConsolidado =
      atualizarContatoDto.ehPrincipal ?? vinculo.ehPrincipal;

    if (atualizarContatoDto.tipoContato || atualizarContatoDto.valor) {
      const existeDuplicidade = await this.verificarDuplicidade(
        vinculo.pessoaId,
        tipoConsolidado,
        valorConsolidado,
        id,
        manager,
      );

      if (existeDuplicidade) {
        throw new ConflictException(
          'Já existe um contato com estes dados para esta pessoa.',
        );
      }
    }

    // Valida as regras de negócio do conjunto de contatos após atualização
    const contatosPessoa = await pcRepo.find({
      where: { pessoaId: vinculo.pessoaId },
      relations: { contato: true },
    });

    const contatosConsolidados = contatosPessoa
      .filter((pc) => Boolean(pc.contato))
      .map((pc) => {
        if (pc.contatoId === id) {
          return {
            tipoContato: tipoConsolidado,
            ehPrincipal: ehPrincipalConsolidado,
          };
        }
        return {
          tipoContato: pc.contato.tipoContato,
          ehPrincipal: atualizarContatoDto.ehPrincipal === true ? false : pc.ehPrincipal,
        };
      });

    validarRegrasContatos(contatosConsolidados);

    try {
      if (atualizarContatoDto.ehPrincipal === true) {
        await pcRepo.update(
          { pessoaId: vinculo.pessoaId },
          { ehPrincipal: false },
        );
        vinculo.ehPrincipal = true;
        await pcRepo.save(vinculo);
      } else if (atualizarContatoDto.ehPrincipal === false) {
        vinculo.ehPrincipal = false;
        await pcRepo.save(vinculo);
      }

      contatoRepo.merge(contatoAtual, atualizarContatoDto);
      return await contatoRepo.save(contatoAtual);
    } catch (erro) {
      if (erro instanceof BadRequestException || erro instanceof ConflictException) {
        throw erro;
      }
      const mensagemErro =
        erro instanceof Error ? erro.message : 'Erro desconhecido';
      this.logger.error(`Erro ao atualizar contato: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao atualizar contato.');
    }
  }

  async remover(id: string): Promise<void> {
    await this.buscarPorId(id);

    const vinculo = await this.pessoaContatoRepository.findOne({
      where: { contatoId: id },
    });

    if (vinculo) {
      const restantes = await this.pessoaContatoRepository.find({
        where: { pessoaId: vinculo.pessoaId },
        relations: { contato: true },
      });

      const contatosAposRemocao = restantes
        .filter((pc) => pc.contatoId !== id && Boolean(pc.contato))
        .map((pc) => ({
          tipoContato: pc.contato.tipoContato,
          ehPrincipal: pc.ehPrincipal,
        }));

      validarRegrasContatos(contatosAposRemocao);
    }

    try {
      await this.pessoaContatoRepository.softDelete({ contatoId: id });
      await this.repository.softDelete(id);
    } catch (erro) {
      if (erro instanceof NotFoundException || erro instanceof BadRequestException) {
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
    this.logger.debug(
      `Verificando se a pessoa ${pessoaId} possui algum contato do tipo CELULAR.`,
    );
    const pcRepository = manager
      ? manager.getRepository(PessoaContato)
      : this.pessoaContatoRepository;

    const resultado = await pcRepository.existsBy({
      pessoaId,
      contato: { tipoContato: TipoContato.CELULAR },
    });
    this.logger.debug(
      `Resultado da verificação de celular para pessoa ${pessoaId}: ${resultado}`,
    );
    return resultado;
  }
}
