import {
  Injectable, UnauthorizedException,
} from '@nestjs/common';

import { SignInRequest } from 'src/modules/auth/requests/signin.request';
import { JwtAuthService } from 'src/modules/jwt-auth/services/jwt-auth.service';
import { UsersService } from 'src/modules/users/users.services';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtAuthService: JwtAuthService,
  ) {}

  async login(body: SignInRequest): Promise<any> {
    const user = await this.usersService.findByEmail(body.email);
    if (user?.password !== body.password) {
      await this.usersService.update(user.id, {
        lastLogin: user.lastLogin,
        loginAttempts: user.loginAttempts + 1,
      });

      // take action if login attempts is greater than 5
      throw new UnauthorizedException('Invalid credential');
    }
    const userBody = {
      id: user.id,
      email: user.email,
      role: user.role,
      hasBusiness: user.hasBusiness,
    };
    const { accessToken, refreshToken } = this.jwtAuthService.login(userBody);
    await this.usersService.update(user.id, {
      lastLogin: new Date(),
      loginAttempts: 0,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isPhoneVerify: user.isPhoneVerify,
        isEmailVerify: user.isEmailVerify,
        role: user.role,
        hasBusiness: user.hasBusiness,
      },
    };
  }
}
