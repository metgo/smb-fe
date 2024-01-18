import {
  Injectable, UnauthorizedException,
} from '@nestjs/common';

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

  async login(body: SignInRequest): Promise<any> {
    const user = await this.usersService.findByEmail(body.email);
    const isPasswordValid = await this.hashService.validate(user.password, body.password);

    if (!isPasswordValid) {
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

    const [splittedfirstName, splittedlastName] = (user.fullName || '').split(' ');

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        firstName: user.firstName || splittedfirstName,
        lastName: user.lastName || splittedlastName,
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
