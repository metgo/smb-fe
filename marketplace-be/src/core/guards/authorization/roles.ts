import { SetMetadata, UseGuards } from '@nestjs/common';
import { RoleGuard } from './role.guards';

// eslint-disable-next-line no-sequences
export const Roles
  = (...roles: string[]) => (target: any, key?: string, discritptor?: any) => {
    SetMetadata('roles', roles)(target, key, discritptor);
    UseGuards(RoleGuard)(target, key, discritptor);
  };
