import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentRequiredException extends HttpException {
  constructor(message: string) {
    super(
      {
        message,
        error: 'Payment Required',
        statusCode: HttpStatus.PAYMENT_REQUIRED,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
