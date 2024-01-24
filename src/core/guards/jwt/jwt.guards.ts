/* eslint-disable no-mixed-operators */
/* eslint-disable no-bitwise */
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
    console.log(request.headers.authorization);
    const token = request.headers.authorization?.replace('Bearer ', '');
    console.log(token);
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
    const [splittedfirstName, splittedlastName] = (user.fullName || '').split(' ');

    request.user = {
      id: user.id,
      fullName: user.fullName,
      firstName: user.firstName || splittedfirstName,
      lastName: user.lastName || splittedlastName,
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
