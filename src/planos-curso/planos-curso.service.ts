import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginacaoRespostaDto } from 'src/dtos/paginacao-resposta.dto';
import { EntityNotFoundError, Repository } from 'typeorm';

import { AtualizarPlanoCursoDto } from './dto/atualizar-planos-curso.dto';
import { CriarPlanoCursoDto } from './dto/criar-plano-curso.dto';
import { PlanosCurso } from './entities/planos-curso.entity';

@Injectable()
export class PlanosCursoService {
  private readonly logger = new Logger(PlanosCursoService.name);

  constructor(
    @InjectRepository(PlanosCurso)
    private readonly repository: Repository<PlanosCurso>,
  ) {}

  async criar(criarPlanoCursoDto: CriarPlanoCursoDto): Promise<PlanosCurso> {
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
    limite = 10,
    pagina = 1,
  ): Promise<PaginacaoRespostaDto<PlanosCurso>> {
    try {
      const take = limite;
      const skip = (pagina - 1) * limite;

      const [planosCurso, total] = await this.repository.findAndCount({
        order: { nome: 'ASC' },
        take,
        skip,
      });

      return new PaginacaoRespostaDto<PlanosCurso>(
        planosCurso,
        total,
        limite,
        pagina,
      );
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao buscar planos de curso: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao buscar planos de curso.');
    }
  }

  async buscarPorId(id: string): Promise<PlanosCurso> {
    try {
      return await this.repository.findOneByOrFail({ id });
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
  ): Promise<PlanosCurso> {
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
    await this.buscarPorId(id);

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
