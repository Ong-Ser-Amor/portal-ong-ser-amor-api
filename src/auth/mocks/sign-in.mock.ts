import { mockUser } from 'src/users/mocks/user.mock';

import { SignInDto } from '../dto/sign-in.dto';

export const mockSignInDto: SignInDto = {
  email: mockUser.email,
  password: 'password',
};
