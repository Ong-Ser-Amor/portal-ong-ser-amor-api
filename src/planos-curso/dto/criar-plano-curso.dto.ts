import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CriarPlanoCursoDto {
  @ApiProperty({ example: 'Introdução à Lógica de Programação' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, {
    message: 'O nome do plano de curso deve conter pelo menos 3 caracteres',
  })
  @MaxLength(100, {
    message: 'O nome do plano de curso deve conter no máximo 100 caracteres',
  })
  nome: string;

  @ApiProperty({ example: '1' })
  @IsString()
  @IsNotEmpty()
  cursoId: string;
}
