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
    limite = 10,
    pagina = 1,
  ): Promise<PaginacaoRespostaDto<Curso>> {
    try {
      const take = limite;
      const skip = (pagina - 1) * limite;

      const [cursos, total] = await this.repository.findAndCount({
        order: { nome: 'ASC' },
        take,
        skip,
      });

      return new PaginacaoRespostaDto<Curso>(cursos, total, limite, pagina);
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : `Ocorreu um erro inesperado: ${String(error)}`;
      this.logger.error(`Erro ao buscar cursos: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao buscar cursos.');
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

      throw new InternalServerErrorException('Erro ao atualizar curso');
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
      this.logger.error(`Erro ao remover curso: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao remover curso');
    }
  }

  private async verificarDuplicidadeNome(
    nome: string,
    cursoIgnoradoId?: string,
  ): Promise<void> {
    const query = this.repository
      .createQueryBuilder('curso')
      .where('LOWER(curso.nome) = LOWER(:nome)', { nome });

    // Se estiver atualizando, ignora o próprio curso para não dar falso positivo
    if (cursoIgnoradoId) {
      query.andWhere('curso.id != :cursoIgnoradoId', { cursoIgnoradoId });
    }

    const existe = await query.getExists();

    if (existe) {
      throw new ConflictException(
        `Já existe um curso cadastrado com o nome '${nome}'.`,
      );
    }
  }
}
