import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentRequiredException extends HttpException {
  constructor(message = 'Payment is required for this voucher.') {
    super(message, HttpStatus.PAYMENT_REQUIRED);
  }
}
