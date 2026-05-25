import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, EntityNotFoundError, Repository } from 'typeorm';

import { AtualizarEnderecoDto } from './dto/atualizar-endereco.dto';
import { CriarEnderecoDto } from './dto/criar-endereco.dto';
import { Endereco } from './entities/endereco.entity';

@Injectable()
export class EnderecosService {
  private readonly logger = new Logger(EnderecosService.name);

  constructor(
    @InjectRepository(Endereco)
    private readonly repository: Repository<Endereco>,
  ) {}

  async criar(
    criarEnderecoDto: CriarEnderecoDto,
    manager?: EntityManager,
  ): Promise<Endereco> {
    const enderecoRepo = manager
      ? manager.getRepository(Endereco)
      : this.repository;

    try {
      const endereco = enderecoRepo.create(criarEnderecoDto);
      return await enderecoRepo.save(endereco);
    } catch (erro) {
      this.logger.error(
        `Erro ao criar endereço: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
      throw new InternalServerErrorException(
        'Ocorreu um erro ao criar o endereço.',
      );
    }
  }

  async buscarPorId(id: string, manager?: EntityManager): Promise<Endereco> {
    const enderecoRepo = manager
      ? manager.getRepository(Endereco)
      : this.repository;

    try {
      return await enderecoRepo.findOneOrFail({ where: { id } });
    } catch (erro) {
      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(`Endereço com ID ${id} não encontrado.`);
      }
      this.logger.error(
        `Erro ao buscar endereço: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
      throw new InternalServerErrorException(
        'Ocorreu um erro ao buscar o endereço.',
      );
    }
  }

  async atualizar(
    id: string,
    atualizarEnderecoDto: AtualizarEnderecoDto,
    manager?: EntityManager,
  ): Promise<Endereco> {
    const enderecoRepo = manager
      ? manager.getRepository(Endereco)
      : this.repository;

    const endereco = await this.buscarPorId(id, manager);

    try {
      enderecoRepo.merge(endereco, atualizarEnderecoDto);
      return await enderecoRepo.save(endereco);
    } catch (erro) {
      this.logger.error(
        `Erro ao atualizar endereço ${id}: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
      throw new InternalServerErrorException('Erro ao atualizar o endereço.');
    }
  }

  async remover(id: string, manager?: EntityManager): Promise<void> {
    const enderecoRepo = manager
      ? manager.getRepository(Endereco)
      : this.repository;

    await this.buscarPorId(id, manager);

    try {
      await enderecoRepo.softDelete(id);
    } catch (erro) {
      if (erro instanceof NotFoundException) throw erro;

      this.logger.error(
        `Erro ao remover endereço ${id}: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
      throw new InternalServerErrorException('Erro ao remover o endereço.');
    }
  }
}
