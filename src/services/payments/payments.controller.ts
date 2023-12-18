import {
  Controller, Get, HttpStatus, Req, Res,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { PaymentsService } from './payments.service';

@Controller('payment')
export class PaymentsController {
  constructor(
    private readonly paymentService: PaymentsService,
  ) { }

  @ApiEndpoint({
    tags: ['Payment'],
    softBlockExtraDtoFields: true,
  })
  @Get('success')
  async success(@Req() request: Request, @Res() response: Response) {
    await this.paymentService.paymentSucess(request);
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
  async failure() {
    console.log('test');
  }
}
