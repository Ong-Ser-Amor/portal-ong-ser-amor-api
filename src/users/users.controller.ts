import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { ReturnUserDto } from './dto/return-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserDecorator } from 'src/decorators/user.decorator';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<ReturnUserDto> {
    return new ReturnUserDto(await this.usersService.create(createUserDto));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ReturnUserDto> {
    return new ReturnUserDto(await this.usersService.findOne(id));
  }

  @Patch(':id/password')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @UserDecorator() userId: number,
  ): Promise<ReturnUserDto> {
    return new ReturnUserDto(
      await this.usersService.updatePassword(userId, updatePasswordDto),
    );
  }
}
