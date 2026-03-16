import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Matches,
  ValidateIf,
} from 'class-validator';

import { ContactType } from '../enums/contact-type.enum';

export class CreateContactDto {
  @ApiProperty({
    enum: ContactType,
    example: ContactType.MOBILE,
  })
  @IsEnum(ContactType)
  @IsNotEmpty()
  contactType: ContactType;

  // -------------------------------------------------------------------
  // VALIDAÇÕES DINÂMICAS COM BASE NO TIPO DE CONTATO
  // -------------------------------------------------------------------

  // 1. Se for EMAIL: Regra padrão de e-mail
  @ValidateIf(
    (object: CreateContactDto) => object.contactType === ContactType.EMAIL,
  )
  @IsEmail({}, { message: 'Value must be a valid email address' })

  // 2. Se for MOBILE: Exatamente 11 dígitos (Ex: 11 9 9999 9999)
  @ValidateIf(
    (object: CreateContactDto) => object.contactType === ContactType.MOBILE,
  )
  @Matches(/^[0-9]{11}$/, {
    message: 'Mobile number must contain exactly 11 digits (only numbers)',
  })

  // 3. Se for LANDLINE: Exatamente 10 dígitos (Ex: 11 4000 0000)
  @ValidateIf(
    (object: CreateContactDto) => object.contactType === ContactType.LANDLINE,
  )
  @Matches(/^[0-9]{10}$/, {
    message: 'Landline number must contain exactly 10 digits (only numbers)',
  })
  value: string;
}
