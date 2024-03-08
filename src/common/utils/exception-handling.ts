import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  InternalServerErrorException,
  MethodNotAllowedException,
  NotFoundException,
  PayloadTooLargeException,
  UnauthorizedException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { ServerErrors } from 'src/common/constant';

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
  if (err instanceof GoneException) {
    throw new GoneException(err.message);
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
  }
  if (err instanceof mongoose.Error.CastError) {
    if (err?.name === 'CastError' && err?.kind === 'ObjectId') {
      if (err?.path) {
        throw new BadRequestException(
          `${err?.path.toUpperCase()} ${ServerErrors.INVALID}`,
        );
      }
      if (err?.model?.modelName) {
        throw new BadRequestException(
          `${err?.model?.modelName} ${ServerErrors.INVALID_ID}`,
        );
      }
      throw new BadRequestException(`The used ${ServerErrors.INVALID_ID}`);
    }
    throw new InternalServerErrorException('Error in database');
  } else {
    throw new Error(err);
  }
};
