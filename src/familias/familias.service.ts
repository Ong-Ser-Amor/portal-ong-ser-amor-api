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
import { EnderecosService } from 'src/enderecos/enderecos.service';
import { EntityManager, EntityNotFoundError, Repository } from 'typeorm';

import { CriarFamiliaDto } from './dto/criar-familia.dto';
import { UpdateFamiliaDto } from './dto/update-familia.dto';
import { Familia } from './entities/familia.entity';

@Injectable()
export class FamiliasService {
  private readonly logger = new Logger(FamiliasService.name);

  constructor(
    @Inject(EnderecosService)
    private readonly enderecosService: EnderecosService,
    @InjectRepository(Familia)
    private readonly repository: Repository<Familia>,
    @Inject(forwardRef(() => BeneficiariosService))
    private readonly beneficiariosService: BeneficiariosService,
  ) {}

  async criar(
    criarFamiliaDto: CriarFamiliaDto,
    manager: EntityManager,
  ): Promise<Familia> {
    const familiaRepo = manager
      ? manager.getRepository(Familia)
      : this.repository;

    try {
      const enderecoCriado = await this.enderecosService.criar(
        criarFamiliaDto.endereco,
        manager,
      );

      const dadosFamilia = {
        faixaRenda: criarFamiliaDto.faixaRenda,
        possuiBeneficioSocial: criarFamiliaDto.possuiBeneficioSocial,
        tipoMoradia: criarFamiliaDto.tipoMoradia,
        enderecoId: enderecoCriado.id,
      };

      const familia = familiaRepo.create(dadosFamilia);
      return await familiaRepo.save(familia);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : 'Erro desconhecido ao criar família.';
      this.logger.error(`Erro ao criar família: ${mensagemErro}`);
      throw new InternalServerErrorException(
        'Ocorreu um erro ao criar a família. Por favor, tente novamente.',
      );
    }
  }

  async buscarPorId(id: string, manager?: EntityManager): Promise<Familia> {
    const familiaRepo = manager
      ? manager.getRepository(Familia)
      : this.repository;

    try {
      return await familiaRepo.findOneOrFail({
        where: { id },
        relations: ['endereco'],
      });
    } catch (erro) {
      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(`Família com ID ${id} não encontrada.`);
      }
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : 'Erro desconhecido ao buscar família.';
      this.logger.error(`Erro ao buscar família: ${mensagemErro}`);
      throw new InternalServerErrorException(
        'Ocorreu um erro ao buscar a família. Por favor, tente novamente.',
      );
    }
  }

  async buscarTodos(take = 10, skip = 0): Promise<[Familia[], number]> {
    try {
      return await this.repository.findAndCount({
        relations: ['endereco'],
        take,
        skip,
        order: { criadoEm: 'DESC' }, // Retorna as famílias mais recentes primeiro
      });
    } catch (erro) {
      this.logger.error(
        `Erro ao buscar lista de famílias: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
      throw new InternalServerErrorException('Erro ao buscar as famílias.');
    }
  }

  async atualizar(
    id: string,
    atualizarFamiliaDto: UpdateFamiliaDto,
    manager?: EntityManager,
  ): Promise<Familia> {
    const familiaRepo = manager
      ? manager.getRepository(Familia)
      : this.repository;

    const familia = await this.buscarPorId(id, manager);

    try {
      familiaRepo.merge(familia, atualizarFamiliaDto);
      return await familiaRepo.save(familia);
    } catch (erro) {
      this.logger.error(
        `Erro ao atualizar família ${id}: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
      throw new InternalServerErrorException('Erro ao atualizar a família.');
    }
  }

  async remover(id: string, manager?: EntityManager): Promise<void> {
    const familiaRepo = manager
      ? manager.getRepository(Familia)
      : this.repository;

    await this.buscarPorId(id, manager);

    const possuiMembros =
      await this.beneficiariosService.existeBeneficiarioNaFamilia(id, manager);

    if (possuiMembros) {
      throw new ConflictException(
        'Esta família não pode ser removida pois existem beneficiários vinculados a ela.',
      );
    }

    try {
      await familiaRepo.softDelete(id);
    } catch (erro) {
      if (erro instanceof NotFoundException) throw erro;

      this.logger.error(
        `Erro ao remover família ${id}: ${erro instanceof Error ? erro.message : String(erro)}`,
      );
      throw new InternalServerErrorException('Erro ao remover a família.');
    }
  }
}
