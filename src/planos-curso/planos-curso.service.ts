import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PayloadJwtDto } from 'src/autenticacao/dto/payload-jwt.dto';
import { PaginacaoRespostaDto } from 'src/shared/dtos/paginacao-resposta.dto';
import { temAcessoIrrestritoEmCursos } from 'src/shared/utils/permissao-cursos.util';
import { EntityNotFoundError, Repository } from 'typeorm';

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
    usuario: PayloadJwtDto,
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

      const queryBuilder = this.repository
        .createQueryBuilder('planoCurso')
        .leftJoinAndSelect('planoCurso.curso', 'curso');

      if (cursoId) {
        queryBuilder.andWhere('planoCurso.cursoId = :cursoId', { cursoId });
      }

      if (!temAcessoIrrestritoEmCursos(usuario)) {
        queryBuilder
          .innerJoin(
            'turmas',
            'turma',
            'turma.plano_curso_id = planoCurso.id AND turma.deletado_em IS NULL',
          )
          .innerJoin(
            'turmas_professores',
            'tp',
            'tp.turma_id = turma.id AND tp.deletado_em IS NULL',
          )
          .andWhere('tp.professor_id = :professorId', {
            professorId: usuario.voluntarioId,
          })
          .distinct(true);
      }

      queryBuilder.orderBy('planoCurso.nome', 'ASC').skip(skip).take(take);

      const [planosCurso, total] = await queryBuilder.getManyAndCount();

      return new PaginacaoRespostaDto<PlanoCurso>(
        planosCurso,
        total,
        itensPorPagina,
        pagina,
      );
    } catch (erro) {
      if (
        erro instanceof BadRequestException ||
        erro instanceof ForbiddenException
      ) {
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

  async validarPermissaoAcesso(
    id: string,
    usuario: PayloadJwtDto,
  ): Promise<void> {
    if (!temAcessoIrrestritoEmCursos(usuario)) {
      const temVinculo = await this.repository
        .createQueryBuilder('planoCurso')
        .innerJoin(
          'turmas',
          'turma',
          'turma.plano_curso_id = planoCurso.id AND turma.deletado_em IS NULL',
        )
        .innerJoin(
          'turmas_professores',
          'tp',
          'tp.turma_id = turma.id AND tp.deletado_em IS NULL',
        )
        .where('planoCurso.id = :id', { id })
        .andWhere('tp.professor_id = :professorId', {
          professorId: usuario.voluntarioId,
        })
        .getExists();

      if (!temVinculo) {
        await this.validarExistencia(id);
        throw new ForbiddenException(
          'Usuário não tem permissão para acessar ou manipular dados deste plano de curso.',
        );
      }
      return;
    }

    await this.validarExistencia(id);
  }

  async buscarPorId(id: string, usuario: PayloadJwtDto): Promise<PlanoCurso> {
    try {
      const planoCurso = await this.repository.findOneOrFail({
        where: { id },
        relations: ['curso'],
      });

      await this.validarPermissaoAcesso(id, usuario);

      return planoCurso;
    } catch (erro) {
      if (
        erro instanceof ForbiddenException ||
        erro instanceof NotFoundException
      ) {
        throw erro;
      }

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
    usuario: PayloadJwtDto,
  ): Promise<PlanoCurso> {
    const planoCurso = await this.buscarPorId(id, usuario);

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
