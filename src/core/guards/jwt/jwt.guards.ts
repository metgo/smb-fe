import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
  CanActivate,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.services';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        throw new UnauthorizedException('Unauthorized access');
      }

      const decoded = this.jwtService.verify(token);
      const user = await this.userService.findByEmail(decoded.email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      request.user = {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        email: user.email,
        role: user.role,
        isPhoneVerify: user.isPhoneVerify,
        isEmailVerify: user.isEmailVerify,
        hasBusiness: user.hasBusiness,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized access');
    }
  }
}
