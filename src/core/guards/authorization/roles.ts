import { SetMetadata, UseGuards } from '@nestjs/common';
import { UserType } from 'src/modules/users/users.type';
import { RoleGuard } from './role.guards';

// eslint-disable-next-line no-sequences
export const Roles = (...roles: UserType[]) => (SetMetadata('roles', roles), UseGuards(RoleGuard));
