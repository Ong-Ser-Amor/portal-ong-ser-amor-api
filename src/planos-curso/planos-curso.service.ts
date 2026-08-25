import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { EntityNotFoundError, FindOptionsWhere, Repository } from 'typeorm';

import { AtualizarPlanoCursoDto } from './dto/atualizar-planos-curso.dto';
import { CriarPlanoCursoDto } from './dto/criar-plano-curso.dto';
import { PlanoCurso } from './entities/plano-curso.entity';

@Injectable()
export class PlanosCursoService {
  private readonly logger = new Logger(PlanosCursoService.name);

  constructor(
    @InjectRepository(PlanoCurso)
    private readonly repository: Repository<PlanoCurso>,
  ) {}

  async criar(criarPlanoCursoDto: CriarPlanoCursoDto): Promise<PlanoCurso> {
    await this.verificarDuplicidadeNome(
      criarPlanoCursoDto.nome,
      criarPlanoCursoDto.cursoId,
    );

    try {
      const planosCurso = this.repository.create(criarPlanoCursoDto);
      return this.repository.save(planosCurso);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao criar plano de curso: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao criar plano de curso.');
    }
  }

  async buscarTodos(
    pagina = 1,
    itensPorPagina = 10,
    cursoId?: string,
  ): Promise<PaginacaoRespostaDto<PlanoCurso>> {
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

      const where: FindOptionsWhere<PlanoCurso> = {};

      if (cursoId) {
        where.cursoId = cursoId;
      }

      const [planosCurso, total] = await this.repository.findAndCount({
        where,
        relations: ['curso'],
        order: { nome: 'ASC' },
        take,
        skip,
      });

      return new PaginacaoRespostaDto<PlanoCurso>(
        planosCurso,
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
      this.logger.error(`Erro ao buscar planos de curso: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao buscar planos de curso.');
    }
  }

  async validarExistencia(id: string): Promise<void> {
    const existe = await this.repository.existsBy({ id });

    if (!existe) {
      throw new NotFoundException(
        `Plano de curso com ID ${id} não encontrado.`,
      );
    }
  }

  async buscarPorId(id: string): Promise<PlanoCurso> {
    try {
      return await this.repository.findOneOrFail({
        where: { id },
        relations: ['curso'],
      });
    } catch (erro) {
      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(
          `Plano de curso com ID ${id} não encontrado.`,
        );
      }

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(
        `Erro ao buscar plano de curso por ID: ${mensagemErro}`,
      );

      throw new InternalServerErrorException(
        'Erro ao buscar plano de curso por ID.',
      );
    }
  }

  async atualizar(
    id: string,
    atualizarPlanoCursoDto: AtualizarPlanoCursoDto,
  ): Promise<PlanoCurso> {
    const planoCurso = await this.buscarPorId(id);

    if (
      atualizarPlanoCursoDto.nome &&
      atualizarPlanoCursoDto.nome !== planoCurso.nome
    ) {
      await this.verificarDuplicidadeNome(
        atualizarPlanoCursoDto.nome,
        planoCurso.cursoId,
        id,
      );
    }

    try {
      this.repository.merge(planoCurso, atualizarPlanoCursoDto);
      return await this.repository.save(planoCurso);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao atualizar plano de curso: ${mensagemErro}`);

      throw new InternalServerErrorException(
        'Erro ao atualizar plano de curso.',
      );
    }
  }

  async remover(id: string): Promise<void> {
    await this.validarExistencia(id);

    try {
      await this.repository.softDelete(id);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao remover plano de curso: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao remover plano de curso.');
    }
  }

  private async verificarDuplicidadeNome(
    nome: string,
    cursoId: string,
    planoCursoIgnoradoId?: string,
  ): Promise<void> {
    const nomeNormalizado = nome.trim();
    const query = this.repository
      .createQueryBuilder('planoCurso')
      .where('planoCurso.cursoId = :cursoId', { cursoId })
      .andWhere(
        'LOWER(f_unaccent(planoCurso.nome)) = LOWER(f_unaccent(:nomeNormalizado))',
        { nomeNormalizado },
      );

    // Se estiver atualizando, ignora o próprio registro
    if (planoCursoIgnoradoId) {
      query.andWhere('planoCurso.id != :planoCursoIgnoradoId', {
        planoCursoIgnoradoId,
      });
    }

    const planoCursoExistente = await query.getExists();

    if (planoCursoExistente) {
      throw new ConflictException(
        `Já existe um plano de curso cadastrado com o nome '${nome}' para este curso.`,
      );
    }
  }
}
