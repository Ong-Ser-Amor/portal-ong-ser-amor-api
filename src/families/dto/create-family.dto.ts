import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { HousingType } from '../enums/housing-type.enum';
import { IncomeRange } from '../enums/income-range.enum';

export class CreateFamilyDto {
  @ApiProperty({
    enum: IncomeRange,
    description: 'The income range of the family',
    example: IncomeRange.FROM_1_TO_3_MINIMUM_WAGE,
  })
  @IsEnum(IncomeRange, {
    message: `incomeRange must be a valid enum value of IncomeRange`,
  })
  @IsNotEmpty()
  incomeRange: IncomeRange;

  @ApiProperty({
    description: 'Indicates whether the family receives income transfer',
    example: true,
  })
  @IsBoolean({ message: 'receivesIncomeTransfer must be a boolean value' })
  receivesIncomeTransfer: boolean;

  @ApiProperty({
    enum: HousingType,
    description: 'The type of housing the family has',
    example: HousingType.RENTED,
  })
  @IsEnum(HousingType, {
    message: `housingType must be a valid enum value of HousingType`,
  })
  @IsNotEmpty()
  housingType: HousingType;

  @ApiProperty({
    description: 'The ID of the address associated with the family',
    example: '1',
  })
  @IsString({ message: 'addressId must be a string' })
  @IsNotEmpty()
  addressId: string;
}
