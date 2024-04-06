import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ServerErrors } from 'src/common/constant';

import { LoginInterface } from 'src/modules/auth/interface/login.interface';
import { SignInRequest } from 'src/modules/auth/requests/signin.request';
import { DMOService } from 'src/modules/dmo/dmo.service';
import { JwtAuthService } from 'src/modules/jwt-auth/services/jwt-auth.service';
import { UsersService } from 'src/modules/users/users.services';
import { UserType } from 'src/modules/users/users.type';
import { HashService } from 'src/services/hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private dmoService: DMOService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtAuthService: JwtAuthService,
    private readonly hashService: HashService,
  ) {}

  async login(body: SignInRequest): Promise<LoginInterface> {
    const user = await this.usersService.validateUserIfNeedToRecover(
      body.email,
    );

    if (!user) {
      throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
    }
    const isPasswordValid = await this.hashService.validate(
      user.password,
      body.password,
    );

    if (user.loginAttempts > 4) {
      throw new UnauthorizedException(ServerErrors.USER.BLOCKED);
    }

    if (!isPasswordValid) {
      await this.usersService.updateLastLogin(user.id, {
        loginAttempts: user.loginAttempts + 1,
      });

      // take action if login attempts is greater than 5
      throw new ForbiddenException(ServerErrors.USER.INVALID_CREDENTIALS);
    }
    const userBody = {
      id: user.id,
      email: user.email,
      role: user.role,
      hasBusiness: user.hasBusiness,
    };
    const { accessToken, refreshToken } = this.jwtAuthService.login(userBody);

    let dmo;
    if (user.role === UserType.DMO || user.role === UserType.DMOADMIN) {
      dmo = await this.dmoService.findDMOByUserID(user.id);
    }
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
        dmo: dmo ? { id: dmo._id, name: dmo.name } : null,
      },
    };
  }
}
