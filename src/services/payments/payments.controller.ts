import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { PaymentsService } from './payments.service';
import { UserType } from 'src/modules/users/users.type';
import { LocaleQuery } from 'src/modules/accessibility/dto/locale-query.dto';

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
      ServerSuccess.PAYMENT.SUCCESS,
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

  @ApiEndpoint({
    noAuthToken: true,
    operation: 'Update Status to Success by superadmin',
    params: [{ name: 'paymentRequestId', type: 'string', required: true }],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PAYMENT.SUCCESS,
    },
    softBlockExtraDtoFields: true,
    tags: ['Payment', 'Admin'],
  })
  @Roles(UserType.SUPERADMIN)
  @UseGuards(JwtAuthGuard)
  @Patch('update-status/:paymentRequestId')
  async updatePaymentStatus(
    @Body() dto: LocaleQuery,
    @Param('paymentRequestId') paymentRequestId: string,
    @Res() response: Response,
  ) {
    await this.paymentService.paymentSucess({
      lowprofilecode: paymentRequestId,
      languagePreference: dto.locale,
    });
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.PAYMENT.SUCCESS,
      null,
      null,
      null,
    );
  }
}
