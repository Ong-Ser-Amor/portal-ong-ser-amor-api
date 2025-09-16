import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { comparePassword, createPasswordHash } from 'src/utils/password';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (await this.findOneByEmail(createUserDto.email).catch(() => undefined)) {
      throw new NotFoundException('User already exists');
    }

    createUserDto.passwordHash = await createPasswordHash(
      createUserDto.passwordHash,
    );

    return await this.repository.save(this.repository.create(createUserDto));
  }

  async findOne(id: number): Promise<User> {
    try {
      return await this.repository.findOneByOrFail({ id });
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.repository.findOneByOrFail({ email });
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    const user = await this.findOne(id);

    if (
      !(await comparePassword(
        updatePasswordDto.oldPassword,
        user?.passwordHash || '',
      ))
    ) {
      throw new BadRequestException('Old password does not match');
    }

    const updatedUser = await this.repository.save({
      ...user,
      password: await createPasswordHash(updatePasswordDto.newPassword),
    });

    return updatedUser;
  }
}
