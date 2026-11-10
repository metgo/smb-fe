/* eslint-disable no-mixed-operators */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
  CanActivate,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ServerErrors } from 'src/common/constant';

import { AuthorityService } from 'src/modules/authority/authority.service';
import { DMOService } from 'src/modules/dmo/dmo.service';
import { UsersService } from 'src/modules/users/users.services';
import { UserType } from 'src/modules/users/users.type';

const whiteListAPI = ['/buy-voucher', '/orders'];

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private authorityService: AuthorityService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly dmoService: DMOService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    let token = request.headers.authorization?.replace('Bearer ', '');

    if (request.headers.cookie) {
      const { accessToken } = request.headers.cookie
        .split(';')
        .map(cookie => cookie.trim().split('='))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      token = accessToken;
    }

    if ((!token || token.length <= 10) && whiteListAPI.includes(request.path)) {
      return true;
    }
    if (!token) {
      throw new UnauthorizedException(ServerErrors.UNAUTHORIZED_ACCESS);
    }

    let decoded;
    try {
      decoded = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException(ServerErrors.UNAUTHORIZED_ACCESS);
    }
    const user = await this.userService.findByEmail(decoded.email);

    if (!user) {
      throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
    }

    let dmo;
    let authority;
    if (user.role === UserType.DMO || user.role === UserType.DMOADMIN) {
      dmo = await this.dmoService.findDMOByUserID(user.id);
    }

    if (
      user.role === UserType.AUTHORITY
      || user.role === UserType.AUTHORITY_ADMIN
    ) {
      authority = await this.authorityService.findAuthorityByUserID(user.id);
      dmo = authority.dmoId;
    }

    request.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneDetails: {
        countryCode: user.countryCode,
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
      authority: authority ? { id: authority._id, name: authority.name } : null,
    };

    return true;
  }
}
