/* eslint-disable no-mixed-operators */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
  CanActivate,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { DMOService } from 'src/modules/dmo/dmo.service';
import { UsersService } from 'src/modules/users/users.services';
import { UserType } from 'src/modules/users/users.type';

const whiteListAPI = ['/buy-voucher', '/orders'];

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly dmoService: DMOService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    if ((!token || token.length <= 10) && whiteListAPI.includes(request.path)) {
      return true;
    }
    if (!token) {
      throw new UnauthorizedException('Unauthorized access');
    }

    let decoded;
    try {
      decoded = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Unauthorized access');
    }
    const user = await this.userService.findByEmail(decoded.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let dmo;
    if (user.role === UserType.DMO || user.role === UserType.DMOADMIN) {
      dmo = await this.dmoService.findDMOByUserID(user.id);
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
    };

    return true;
  }
}
