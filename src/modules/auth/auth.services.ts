import {
  Injectable, NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { ServerErrors } from 'src/common/constant';

import { LoginInterface } from 'src/modules/auth/interface/login.interface';
import { SignInRequest } from 'src/modules/auth/requests/signin.request';
import { JwtAuthService } from 'src/modules/jwt-auth/services/jwt-auth.service';
import { UsersService } from 'src/modules/users/users.services';
import { HashService } from 'src/services/hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtAuthService: JwtAuthService,
    private readonly hashService: HashService,
  ) {}

  async login(body: SignInRequest): Promise<LoginInterface> {
    const user = await this.usersService.validateUserIfNeedToRecover(body.email);

    if (!user) {
      throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
    }
    const isPasswordValid = await this.hashService.validate(user.password, body.password);

    if (user.loginAttempts > 4) {
      throw new UnauthorizedException(ServerErrors.USER.BLOCKED);
    }

    if (!isPasswordValid) {
      await this.usersService.updateLastLogin(user.id, {
        loginAttempts: user.loginAttempts + 1,
      });

      // take action if login attempts is greater than 5
      throw new UnauthorizedException(ServerErrors.USER.INVALID_CREDENTIALS);
    }
    const userBody = {
      id: user.id,
      email: user.email,
      role: user.role,
      hasBusiness: user.hasBusiness,
    };
    const { accessToken, refreshToken } = this.jwtAuthService.login(userBody);
    await this.usersService.updateLastLogin(user.id, {
      lastLogin: new Date(),
      loginAttempts: 0,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneDetails: {
          countryCode: user.countryCode || null,
          phoneNumber: user.phoneNumber,
        },
        languagePreference: user.languagePreference,
        address: user.address,
        dob: user.dob,
        email: user.email,
        isPhoneVerify: user.isPhoneVerify,
        isEmailVerify: user.isEmailVerify,
        role: user.role,
        hasBusiness: user.hasBusiness,
      },
    };
  }
}
