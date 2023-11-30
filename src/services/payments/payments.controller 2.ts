import {
  Controller, Get, HttpStatus, Req, Res,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request, Response } from 'express';
import { responseHelper } from 'src/core/helper/response.helper';

@Controller('payment')
export class PaymentsController {
  constructor(
  private readonly paymentService: PaymentsService,
  ) { }

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

    @Get('failure')
  async failure() {
    console.log('test');
  }
}
