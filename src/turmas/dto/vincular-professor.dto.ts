import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VincularProfessorDto {
  @ApiProperty({
    example: '1',
    description: 'ID do voluntário que atuará como professor',
  })
  @IsString()
  @IsNotEmpty({ message: 'O ID do professor é obrigatório.' })
  professorId: string;
}
