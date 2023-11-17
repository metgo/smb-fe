import {
  CanActivate, ExecutionContext, ForbiddenException, Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { UsersService } from 'src/modules/users/users.services';
import { UserType } from 'src/modules/users/users.type';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private userService: UsersService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return this.validateRequest(context);
  }

  async validateRequest(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.get<UserType[]>('roles', context.getHandler());
    if (!allowedRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log(request.user);
    const loggedInUser = await this.userService.getMyInformation(request.user.id);

    if (!allowedRoles.includes(loggedInUser.role)) {
      throw new ForbiddenException('Access Denied');
    }

    return true;
  }
}
