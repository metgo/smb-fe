import { ValidationPipe } from '@nestjs/common';

export const standardValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
});

export const softValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidUnknownValues: true,
});

export const ServerErrors = {
  USER_NOT_FOUND: 'User not found',
  JWT_EXPIRED_OR_NOT_FOUND: 'Authorization header not found or jwt token has expired',
  FAILED_VALIDATION: 'Failed Validation',
  MAP_POINT_EXISTS: 'This Map Point already exists',
  MAP_POINT_CATEGORIES_EXISTS: 'This Map Point Categories already exists',
  MAP_POINT_SUB_CATEGORIES_EXISTS: 'This Map Point Sub Categories already exists',
  MAP_POINT_SUB_CATEGORIES_ITEMS_EXISTS: 'This Map Point Sub Categories Items already exists',
  MAP_POINT_NOT_FOUND: 'Map Point not found',
  MAP_POINT_CATEGORIES_NOT_FOUND: 'This Map Point Categories not found',
  MAP_POINT_SUB_CATEGORIES_NOT_FOUND: 'This Map Point Sub Categories not found',
  MAP_POINT_SUB_CATEGORIES_ITEMS_NOT_FOUND: 'This Map Point Sub Categories Items not found',
  BUSINESS_NOT_FOUND: 'Business not found',
};

export const ServerSuccess = {
  MAP_POINT_CREATED: 'Map Point was successfully created',
  MAP_POINT_CATEGORIES_CREATED: 'Map Point Categories was successfully created',
  MAP_POINT_SUB_CATEGORIES_CREATED: 'Map Point Sub Categories was successfully created',
  MAP_POINT_SUB_CATEGORIES_ITEMS_CREATED: 'Map Point Sub Categories Items was successfully created',
  MAP_POINT_LISTED: 'Map Point was successfully listed',
  MAP_POINT_CATEGORIES_LISTED: 'Map Point Categories was successfully listed',
  MAP_POINT_SUB_CATEGORIES_LISTED: 'Map Point Sub Categories was successfully listed',
  MAP_POINT_SUB_CATEGORIES_ITEMS_LISTED: 'Map Point Sub Categories Items was successfully listed',
  MAP_POINT_UPDATED: 'Map Point was successfully updated',
  MAP_POINT_CATEGORIES_UPDATED: 'Map Point Categories was successfully updated',
  MAP_POINT_SUB_CATEGORIES_UPDATED: 'Map Point Sub Categories was successfully updated',
  MAP_POINT_SUB_CATEGORIES_ITEMS_UPDATED: 'Map Point Sub Categories Items was successfully updated',
  BUSINESS_CREATED: 'Business was successfully created',
  BUSINESS_LISTED: 'Business was successfully listed',
  BUSINESS_UPDATED: 'Business was successfully updated',

};
