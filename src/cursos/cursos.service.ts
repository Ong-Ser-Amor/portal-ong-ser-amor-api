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

import { AtualizarCursoDto } from './dto/atualizar-curso.dto';
import { CriarCursoDto } from './dto/criar-curso.dto';
import { Curso } from './entities/curso.entity';

@Injectable()
export class CursosService {
  private readonly logger = new Logger(CursosService.name);

  constructor(
    @InjectRepository(Curso)
    private readonly repository: Repository<Curso>,
  ) {}

  async criar(criarCursoDto: CriarCursoDto): Promise<Curso> {
    // 1. Valida duplicidade ANTES de tentar salvar
    await this.verificarDuplicidadeNome(criarCursoDto.nome);

    try {
      const curso = this.repository.create(criarCursoDto);
      return await this.repository.save(curso);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao criar curso: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao criar curso.');
    }
  }

  async buscarTodos(
    usuario: PayloadJwtDto,
    pagina = 1,
    itensPorPagina = 10,
  ): Promise<PaginacaoRespostaDto<Curso>> {
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

      const queryBuilder = this.repository.createQueryBuilder('curso');

      if (!temAcessoIrrestritoEmCursos(usuario)) {
        queryBuilder
          .innerJoin(
            'planos_curso',
            'plano',
            'plano.curso_id = curso.id AND plano.deletado_em IS NULL',
          )
          .innerJoin(
            'turmas',
            'turma',
            'turma.plano_curso_id = plano.id AND turma.deletado_em IS NULL',
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

      queryBuilder.orderBy('curso.nome', 'ASC').skip(skip).take(take);

      const [cursos, total] = await queryBuilder.getManyAndCount();

      return new PaginacaoRespostaDto<Curso>(
        cursos,
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
      this.logger.error(`Erro ao buscar cursos: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao buscar cursos.');
    }
  }

  async validarExistencia(id: string): Promise<void> {
    const existe = await this.repository.existsBy({ id });

    if (!existe) {
      throw new NotFoundException(`Curso com ID ${id} não encontrado.`);
    }
  }

  async validarPermissaoAcesso(
    id: string,
    usuario: PayloadJwtDto,
  ): Promise<void> {
    if (!temAcessoIrrestritoEmCursos(usuario)) {
      const temVinculo = await this.repository
        .createQueryBuilder('curso')
        .innerJoin(
          'planos_curso',
          'plano',
          'plano.curso_id = curso.id AND plano.deletado_em IS NULL',
        )
        .innerJoin(
          'turmas',
          'turma',
          'turma.plano_curso_id = plano.id AND turma.deletado_em IS NULL',
        )
        .innerJoin(
          'turmas_professores',
          'tp',
          'tp.turma_id = turma.id AND tp.deletado_em IS NULL',
        )
        .where('curso.id = :id', { id })
        .andWhere('tp.professor_id = :professorId', {
          professorId: usuario.voluntarioId,
        })
        .getExists();

      if (!temVinculo) {
        await this.validarExistencia(id);
        throw new ForbiddenException(
          'Usuário não tem permissão para acessar ou manipular dados deste curso.',
        );
      }
      return;
    }

    await this.validarExistencia(id);
  }

  async buscarPorId(id: string, usuario: PayloadJwtDto): Promise<Curso> {
    try {
      const curso = await this.repository.findOneByOrFail({
        id,
      });

      await this.validarPermissaoAcesso(id, usuario);

      return curso;
    } catch (erro) {
      if (
        erro instanceof ForbiddenException ||
        erro instanceof NotFoundException
      ) {
        throw erro;
      }

      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(`Curso com ID ${id} não encontrado.`);
      }

      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;

      this.logger.error(`Erro ao buscar curso: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao buscar curso.');
    }
  }

  async atualizar(
    id: string,
    atualizarCursoDto: AtualizarCursoDto,
    usuario: PayloadJwtDto,
  ): Promise<Curso> {
    const curso = await this.buscarPorId(id, usuario);

    if (atualizarCursoDto.nome && atualizarCursoDto.nome !== curso.nome) {
      await this.verificarDuplicidadeNome(atualizarCursoDto.nome, id);
    }

    try {
      this.repository.merge(curso, atualizarCursoDto);
      return await this.repository.save(curso);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao atualizar curso: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao atualizar curso.');
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
      this.logger.error(`Erro ao remover curso: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao remover curso.');
    }
  }

  private async verificarDuplicidadeNome(
    nome: string,
    cursoIgnoradoId?: string,
  ): Promise<void> {
    // aplica trim no nome do curso
    const nomeNormalizado = nome.trim();
    const query = this.repository
      .createQueryBuilder('curso')
      // normaliza o nome do curso para comparação (remove acentos e converte para minúsculas)
      .where(
        'LOWER(f_unaccent(curso.nome)) = LOWER(f_unaccent(:nomeNormalizado))',
        {
          nomeNormalizado,
        },
      );

    // Se estiver atualizando, ignora o próprio curso para não dar falso positivo
    if (cursoIgnoradoId) {
      query.andWhere('curso.id != :cursoIgnoradoId', { cursoIgnoradoId });
    }

    const cursoExistente = await query.getExists();

    if (cursoExistente) {
      throw new ConflictException(
        `Já existe um curso cadastrado com o nome '${nome}'.`,
      );
    }
  }
}
