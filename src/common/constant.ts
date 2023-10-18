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
  USER_NOT_FOUND: 'User Not Found',
  JWT_EXPIRED_OR_NOT_FOUND: 'Authorization header not found or jwt token has expired',
  FAILED_VALIDATION: 'Failed Validation',
};
