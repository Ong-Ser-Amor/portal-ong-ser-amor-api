import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 128, { message: 'Password must be between 8 and 128 characters' })
  newPassword: string;
}
