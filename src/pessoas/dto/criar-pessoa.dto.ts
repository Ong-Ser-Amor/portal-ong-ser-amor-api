import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CriarPessoaDto {
  @ApiProperty({ example: 'Carlos Santos' })
  @IsNotEmpty({ message: 'O campo nome não pode ser vazio' })
  @IsString({ message: 'O campo nome deve ser uma string' })
  nome: string;

  @ApiProperty({ type: String, example: '12345678900' })
  @IsNotEmpty({ message: 'O campo cpf não pode ser vazio' })
  @IsString({ message: 'O campo cpf deve ser uma string' })
  @Length(11, 11, { message: 'O campo cpf deve ter exatamente 11 caracteres.' })
  @Matches(/^\d+$/, { message: 'O campo cpf deve conter apenas números.' })
  cpf: string;

  @ApiProperty({ type: Date, example: '2000-01-01' })
  @IsNotEmpty({ message: 'O campo dataNascimento não pode ser vazio' })
  @IsDate({ message: 'O campo dataNascimento deve ser uma data válida' })
  @Type(() => Date)
  dataNascimento: Date;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean({ message: 'O campo emancipado deve ser booleano' })
  emancipado?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean({ message: 'O campo podeSairSozinho deve ser booleano' })
  podeSairSozinho?: boolean;

  @ApiProperty({ required: false, example: '123456' })
  @IsOptional()
  @IsString({ message: 'O campo responsavelId deve ser uma string' })
  responsavelId?: string;
}
