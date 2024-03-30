import {
  Controller, Get, HttpStatus, Query, Req, Res,
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
  async success(@Req() req, @Res() response: Response, @Query() query) {
    console.log(query, req);
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
    console.log(query);
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

  @ApiEndpoint({
    tags: ['Payment'],
    softBlockExtraDtoFields: true,
  })
  @Get('indicator')
  async indicator(@Req() req, @Res() response: Response, @Query() query) {
    console.log('indicator', query, req);
    // await this.paymentService.PaymentFailure(query);
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
