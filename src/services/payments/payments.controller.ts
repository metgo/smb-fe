import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
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
import { UserType } from 'src/modules/users/users.type';
import { LocaleQuery } from 'src/modules/accessibility/dto/locale-query.dto';
import { PaymentsService } from 'src/services/payments/payments.service';

@Controller('payment')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @ApiEndpoint({
    tags: ['Payment'],
    softBlockExtraDtoFields: true,
  })
  @Get('success')
  async success(@Req() req, @Res() response: Response, @Query() query) {
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
  async getIndicator(@Req() req, @Res() response: Response, @Query() query) {
    console.log('>>>>>>>>>>>GET REQ BODY');
    console.log(req.body);
    console.log('>>>>>>>>>>>GET QUERY');
    console.log(query);
    console.log('>>>>>>>>>>>GET REQ');
    console.log(req);
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
  @Post('indicator')
  async postIndicator(@Req() req, @Res() response: Response, @Query() query) {
    console.log('>>>>>>>>>>>POST REQ BODY');
    console.log(req.body);
    console.log('>>>>>>>>>>>POST QUERY');
    console.log(query);
    console.log('>>>>>>>>>>>POST REQ');
    console.log(req);
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
    tags: ['Payment'],
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

  // @ApiEndpoint({
  //   noAuthToken: true,
  //   operation: 'Start Payment Process step [3]',
  //   response: {
  //     status: HttpStatus.CREATED,
  //     description: ServerSuccess.PAYMENT.START,
  //   },
  //   softBlockExtraDtoFields: true,
  //   tags: ['Order Process'],
  // })
  // @Post('order')
  // async startOrderPaymentProcess(
  //   @Body() dto: OrderPaymentDto,
  //   @Req() req,
  //   @Res() response: Response,
  // ) {
  //   const payment = await this.paymentService.startOrderPaymentProcess(
  //     dto,
  //     req?.user,
  //   );

  //   return responseHelper(
  //     response,
  //     HttpStatus.CREATED,
  //     ServerSuccess.PAYMENT.START,
  //     payment,
  //     null,
  //     null,
  //   );
  // }

  // @ApiEndpoint({
  //   noAuthToken: true,
  //   operation: 'Update PaymentStatus step [4]',
  //   params: [{ name: 'lowProfileId', type: 'string', required: true }],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.PAYMENT.UPDATE,
  //   },
  //   softBlockExtraDtoFields: true,
  //   tags: ['Order Process'],
  // })
  // @Patch('order/:lowProfileId')
  // async updateOrderProcessPaymentStatus(
  //   @Body() dto: UpdatePaymentProcessDto,
  //   @Param('lowProfileId') lowProfileId: string,
  //   @Req() req,
  //   @Res() response: Response,
  // ) {
  //   const payment = await this.paymentService.updateOrderPaymentProcess(
  //     lowProfileId,
  //     dto,
  //     req?.user,
  //   );

  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     `${ServerSuccess.PAYMENT.UPDATE} to ${dto.status}`,
  //     payment,
  //     null,
  //     null,
  //   );
  // }

  // @ApiEndpoint({
  //   noAuthToken: true,
  //   operation: 'Start Payment Process step [2]',
  //   response: {
  //     status: HttpStatus.CREATED,
  //     description: ServerSuccess.PAYMENT.START,
  //   },
  //   softBlockExtraDtoFields: true,
  //   tags: ['Voucher Process'],
  // })
  // @Post('voucher')
  // async startVoucherPaymentProcess(
  //   @Body() dto: VoucherPaymentDto,
  //   @Req() req,
  //   @Res() response: Response,
  // ) {
  //   const payment = await this.paymentService.startVoucherPaymentProcess(
  //     dto,
  //     req?.user,
  //   );

  //   return responseHelper(
  //     response,
  //     HttpStatus.CREATED,
  //     ServerSuccess.PAYMENT.START,
  //     payment,
  //     null,
  //     null,
  //   );
  // }

  // @ApiEndpoint({
  //   noAuthToken: true,
  //   operation: 'Update PaymentStatus step [3]',
  //   params: [{ name: 'lowProfileId', type: 'string', required: true }],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.PAYMENT.UPDATE,
  //   },
  //   softBlockExtraDtoFields: true,
  //   tags: ['Voucher Process'],
  // })
  // @Patch('voucher/:lowProfileId')
  // async updateProcessPaymentStatus(
  //   @Body() dto: UpdatePaymentProcessDto,
  //   @Param('lowProfileId') lowProfileId: string,
  //   @Req() req,
  //   @Res() response: Response,
  // ) {
  //   const payment = await this.paymentService.updateVoucherPaymentProcess(
  //     lowProfileId,
  //     dto,
  //     req?.user,
  //   );

  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     `${ServerSuccess.PAYMENT.UPDATE} to ${dto.status}`,
  //     payment,
  //     null,
  //     null,
  //   );
  // }
}
