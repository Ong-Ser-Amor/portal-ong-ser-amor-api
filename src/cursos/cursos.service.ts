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

      const [cursos, total] = await this.repository.findAndCount({
        order: { nome: 'ASC' },
        take,
        skip,
      });

      return new PaginacaoRespostaDto<Curso>(
        cursos,
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

  async buscarPorId(id: string): Promise<Curso> {
    try {
      return await this.repository.findOneByOrFail({
        id,
      });
    } catch (erro) {
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
  ): Promise<Curso> {
    const curso = await this.buscarPorId(id);

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
