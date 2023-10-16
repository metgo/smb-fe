import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  MethodNotAllowedException, NotFoundException,
  PayloadTooLargeException,
  UnauthorizedException,
} from '@nestjs/common';

export const exceptionHandling = err => {
  if (err instanceof BadRequestException) {
    throw new BadRequestException(err.message);
  }
  if (err instanceof ConflictException) {
    throw new ConflictException(err.message);
  }
  if (err instanceof ForbiddenException) {
    throw new ForbiddenException(err.message);
  }
  if (err instanceof InternalServerErrorException) {
    throw new InternalServerErrorException(err.message);
  }
  if (err instanceof NotFoundException) {
    throw new NotFoundException(err.message);
  }
  if (err instanceof PayloadTooLargeException) {
    throw new PayloadTooLargeException(err.message);
  }
  if (err instanceof UnauthorizedException) {
    throw new UnauthorizedException(err.message);
  }
  if (err instanceof MethodNotAllowedException) {
    throw new MethodNotAllowedException(err.message);
  } else {
    throw new Error(err);
  }
};
