import { ReturnUserDto } from 'src/users/dto/return-user.dto';
import { User } from 'src/users/entities/user.entity';

export class ReturnSignInDto {
  access_token: string;
  user?: ReturnUserDto;

  constructor({ access_token, user }: { access_token: string; user?: User }) {
    this.access_token = access_token;
    this.user = user ? new ReturnUserDto(user) : undefined;
  }
}
