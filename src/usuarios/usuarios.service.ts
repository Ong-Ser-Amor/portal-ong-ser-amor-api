import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';

import { compararSenha, criarSenhaHash } from '../utils/senha';
import { AtualizarSenhaDto } from './dto/atualizar-senha.dto';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,
  ) {}

  async criar(criarUsuarioDto: CriarUsuarioDto): Promise<Usuario> {
    const usuarioExistente = await this.buscarPorEmail(criarUsuarioDto.email);

    if (usuarioExistente) {
      throw new ConflictException('Usuário já cadastrado com este e-mail.');
    }

    try {
      const senhaHash = await criarSenhaHash(criarUsuarioDto.senha);

      const novoUsuario = this.repository.create({
        email: criarUsuarioDto.email,
        senhaHash,
      });

      return await this.repository.save(novoUsuario);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao criar usuário: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao criar usuário.');
    }
  }

  async buscarPorId(id: string): Promise<Usuario> {
    try {
      return await this.repository.findOneByOrFail({ id });
    } catch (erro) {
      if (erro instanceof EntityNotFoundError) {
        throw new NotFoundException(`Usuário não encontrado.`);
      }

      const mensagemErro =
        erro instanceof Error ? erro.message : 'Erro desconhecido';
      this.logger.error(`Erro ao buscar usuário: ${mensagemErro}`);
      throw new InternalServerErrorException('Erro ao buscar usuário.');
    }
  }

  async buscarPorIdComSenha(id: string): Promise<Usuario | null> {
    try {
      return await this.repository
        .createQueryBuilder('usuario')
        .addSelect('usuario.senhaHash') // Referencia a propriedade da entidade TypeScript
        .where('usuario.id = :id', { id })
        .getOne();
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(
        `Erro ao buscar usuário por ID com senha: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao buscar usuário por ID com senha.',
      );
    }
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    try {
      return await this.repository.findOneBy({ email });
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao buscar usuário por e-mail: ${mensagemErro}`);
      throw new InternalServerErrorException(
        'Erro ao buscar usuário por e-mail.',
      );
    }
  }

  async buscarPorEmailOuFalhar(email: string): Promise<Usuario> {
    const usuario = await this.buscarPorEmail(email);
    if (!usuario) {
      throw new NotFoundException(`Usuário não encontrado.`);
    }
    return usuario;
  }

  async buscarPorEmailComSenha(email: string): Promise<Usuario | null> {
    try {
      return await this.repository
        .createQueryBuilder('usuario')
        .addSelect('usuario.senhaHash')
        .where('usuario.email = :email', { email })
        .getOne();
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(
        `Erro ao buscar usuário por e-mail com senha: ${mensagemErro}`,
      );
      throw new InternalServerErrorException(
        'Erro ao buscar usuário por e-mail com senha.',
      );
    }
  }

  async atualizar(
    id: string,
    atualizarUsuarioDto: AtualizarUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.buscarPorId(id);

    // Se o email estiver sendo atualizado, verifica se já existe outro usuário com o mesmo email
    if (
      atualizarUsuarioDto.email &&
      atualizarUsuarioDto.email !== usuario.email
    ) {
      const emailEmUso = await this.buscarPorEmail(atualizarUsuarioDto.email);
      if (emailEmUso && emailEmUso.id !== id) {
        throw new ConflictException(
          'Este e-mail já está em uso por outro usuário.',
        );
      }
    }

    try {
      this.repository.merge(usuario, atualizarUsuarioDto);
      return await this.repository.save(usuario);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao atualizar usuário: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao atualizar usuário.');
    }
  }

  async atualizarSenha(
    id: string,
    atualizarSenhaDto: AtualizarSenhaDto,
  ): Promise<void> {
    const usuario = await this.buscarPorIdComSenha(id);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const senhaCorreta = await compararSenha(
      atualizarSenhaDto.senhaAtual,
      usuario.senhaHash,
    );

    if (!senhaCorreta) {
      throw new BadRequestException('A senha atual está incorreta.');
    }

    try {
      usuario.senhaHash = await criarSenhaHash(atualizarSenhaDto.novaSenha);
      await this.repository.save(usuario);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error
          ? erro.message
          : `Ocorreu um erro inesperado: ${String(erro)}`;
      this.logger.error(`Erro ao atualizar senha: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao atualizar senha.');
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
      this.logger.error(`Erro ao deletar usuário: ${mensagemErro}`);

      throw new InternalServerErrorException('Erro ao deletar usuário.');
    }
  }
}
