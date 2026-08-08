import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CriarFamiliaDto } from 'src/familias/dto/criar-familia.dto';

export class TransferirFamiliaDto {
  // Envia UM dos dois
  @ApiProperty({
    description: 'ID da família destino, se já existir',
    example: '123',
  })
  @ValidateIf((dto: TransferirFamiliaDto) => !dto.novaFamilia)
  @IsString()
  @IsNotEmpty({
    message: 'Informe o familiaId destino ou os dados de uma novaFamilia.',
  })
  familiaId?: string; // Se vai para uma família já existente

  @ApiProperty({
    description: 'Dados para criar o novo núcleo familiar',
    type: CriarFamiliaDto,
  })
  @ValidateIf((dto: TransferirFamiliaDto) => !dto.familiaId)
  @ValidateNested()
  @Type(() => CriarFamiliaDto)
  @IsNotEmpty({
    message: 'Informe os dados da novaFamilia ou o familiaId destino.',
  })
  novaFamilia?: CriarFamiliaDto; // Se vai formar a sua própria família
}
