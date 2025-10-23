import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { comparePassword, createPasswordHash } from 'src/utils/password';
import { EntityNotFoundError, Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    try {
      const passwordHash = await createPasswordHash(createUserDto.password);

      const newUser = this.repository.create({
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
      });

      return await this.repository.save(newUser);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error creating user: ${errorMessage}`);

      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      return await this.repository.findOneByOrFail({ id });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`User not found`);
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error retrieving user: ${errorMessage}`);
      throw new InternalServerErrorException('Error retrieving user');
    }
  }

  async findOneByIdWithPassword(id: number): Promise<User | null> {
    try {
      return await this.repository
        .createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where('user.id = :id', { id }) // <-- AQUI ESTÁ A MUDANÇA
        .getOne();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(
        `Error retrieving user by ID with password: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'Error retrieving user by ID with password',
      );
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    try {
      return await this.repository.findOneBy({ email });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error retrieving user by email: ${errorMessage}`);
      throw new InternalServerErrorException('Error retrieving user by email');
    }
  }

  async findOneByEmailOrFail(email: string): Promise<User> {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async findOneByEmailWithPassword(email: string): Promise<User | null> {
    try {
      return await this.repository
        .createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where('user.email = :email', { email })
        .getOne();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(
        `Error retrieving user by email with password: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'Error retrieving user by email with password',
      );
    }
  }

  async update(
    id: number,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<User> {
    const user = await this.findOne(id);

    // Se o email estiver sendo atualizado, verifica se já existe outro usuário com o mesmo email
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.findOneByEmail(updateUserDto.email);
      if (emailExists && emailExists.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    try {
      this.repository.merge(user, updateUserDto);
      return await this.repository.save(user);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error updating user: ${errorMessage}`);

      throw new InternalServerErrorException('Error updating user');
    }
  }

  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.findOneByIdWithPassword(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatch = await comparePassword(
      updatePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!passwordMatch) {
      throw new BadRequestException('Current password does not match');
    }

    try {
      user.passwordHash = await createPasswordHash(
        updatePasswordDto.newPassword,
      );
      await this.repository.save(user);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error updating password: ${errorMessage}`);

      throw new InternalServerErrorException('Error updating password');
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    try {
      await this.repository.softDelete(id);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error deleting user: ${errorMessage}`);

      throw new InternalServerErrorException('Error deleting user');
    }
  }
}
