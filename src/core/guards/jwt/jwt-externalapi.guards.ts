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

import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { UsersService } from 'src/modules/users/users.services';

const whiteListAPI = ['/buy-voucher', '/orders'];

@Injectable()
export class JwtExternalApiAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly externalApiService: ExternalApiServices,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    if ((!token || token.length <= 10) && whiteListAPI.includes(request.path)) {
      return true;
    }
    if (!token) {
      throw new UnauthorizedException(ServerErrors.FORBIDDEN);
    }

    let decoded;
    try {
      decoded = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException(ServerErrors.FORBIDDEN);
    }
    const user = await this.userService.findByEmail(decoded.email);

    if (!user) {
      throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
    }

    if (decoded.externalApiId.toString() !== user.externalApiId.toString()) {
      throw new UnauthorizedException(ServerErrors.FORBIDDEN);
    }

    if (!user.externalApiId) {
      throw new NotFoundException(ServerErrors.EXTERNAL_API.NOT_FOUND);
    }

    const validExternalApi = await this.externalApiService.getById(
      user.externalApiId.toString(),
    );

    if (!validExternalApi) {
      throw new NotFoundException(ServerErrors.EXTERNAL_API.NOT_FOUND);
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
      externalApi: {
        id: validExternalApi.id,
        identifierId: validExternalApi.identifierId,
      },
    };

    return true;
  }
}
