import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CriarCursoDto {
  @ApiProperty({ example: 'Avenida Brasil' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, {
    message: 'O nome do curso deve conter pelo menos 3 caracteres',
  })
  @MaxLength(100, {
    message: 'O nome do curso deve conter no máximo 100 caracteres',
  })
  nome: string;
}
