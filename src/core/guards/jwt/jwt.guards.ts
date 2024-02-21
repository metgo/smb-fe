/* eslint-disable no-mixed-operators */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
  CanActivate,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.services';

const whiteListAPI = [
  '/buy-voucher',
  '/orders',
];

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
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

    request.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneDetails: {
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
      },
      address: user.address,
      email: user.email,
      role: user.role,
      isPhoneVerify: user.isPhoneVerify,
      isEmailVerify: user.isEmailVerify,
      hasBusiness: user.hasBusiness,
    };

    return true;
  }
}
