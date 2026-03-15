import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { ContactType } from '../enums/contact-type.enum';

export class CreateContactDto {
  @ApiProperty({
    enum: ContactType,
    example: ContactType.MOBILE,
  })
  @IsEnum(ContactType)
  @IsNotEmpty()
  contactType: ContactType;

  @ApiProperty({
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  value: string;
}
