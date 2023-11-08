import { SetMetadata } from '@nestjs/common';
import { UserType } from 'src/modules/users/users.type';

export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);
