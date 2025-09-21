import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { User } from 'src/users/entities/user.entity';

export class ReturnSignInDto {
  access_token: string;
  user?: UserResponseDto;

  constructor({ access_token, user }: { access_token: string; user?: User }) {
    this.access_token = access_token;
    this.user = user ? new UserResponseDto(user) : undefined;
  }
}
