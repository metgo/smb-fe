import {
  Controller, Get, HttpStatus, Query, Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { PaymentsService } from './payments.service';

@Controller('payment')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @ApiEndpoint({
    tags: ['Payment'],
    softBlockExtraDtoFields: true,
  })
  @Get('success')
  async success(@Res() response: Response, @Query() query) {
    await this.paymentService.paymentSucess(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      'Your payment was successfully paid',
      null,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Payment'],
    softBlockExtraDtoFields: true,
  })
  @Get('failure')
  async failure(@Res() response: Response, @Query() query) {
    await this.paymentService.PaymentFailure(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      'Your payment was not successfully paid',
      null,
      null,
      null,
    );
  }
}
