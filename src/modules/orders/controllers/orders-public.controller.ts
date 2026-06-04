import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { ServerSuccess, ServerErrors } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { exceptionHandling } from 'src/common/utils/exception-handling';

import { OrdersService } from '../orders.services';
import { QrTokenService } from 'src/services/qr-token/qr-token.service';
import { UpdateOrderStatusPublicDto } from '../dto/update-order-status-public.dto';

@Controller('public/orders')
export class OrdersPublicController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly qrTokenService: QrTokenService,
  ) {}

  @ApiEndpoint({
    tags: ['Public Orders'],
    response: {
      status: HttpStatus.OK,
      description: 'Order details fetched via QR token',
    },
    noAuthToken: true,
    operation: 'Get order details using QR verification token (no auth)',
  })
  @Get('verify/:token')
  async getOrderByQrToken(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    try {
      const clientIp
        = (req.headers['x-forwarded-for'] as string)?.split(',')[0]
        || req.socket.remoteAddress
        || '';

      const orderId = await this.qrTokenService.verifyToken(token, clientIp);
      const order = await this.ordersService.findOneById(orderId);

      if (!order) {
        return responseHelper(
          response,
          HttpStatus.NOT_FOUND,
          ServerErrors.ORDERS.NOT_FOUND,
          null,
          null,
          null,
        );
      }

      return responseHelper(
        response,
        HttpStatus.OK,
        ServerSuccess.ORDERS.LISTED,
        order,
        null,
        null,
      );
    } catch (error) {
      exceptionHandling(error);
    }
  }

  @ApiEndpoint({
    tags: ['Public Orders'],
    response: {
      status: HttpStatus.OK,
      description: 'Order status updated via QR token',
    },
    noAuthToken: true,
    operation: 'Update order status using QR verification token (no auth)',
  })
  @HttpCode(HttpStatus.OK)
  @Post('verify/:token/update-status')
  async updateOrderStatusByQrToken(
    @Param('token') token: string,
    @Body() body: UpdateOrderStatusPublicDto,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    try {
      const clientIp
        = (req.headers['x-forwarded-for'] as string)?.split(',')[0]
        || req.socket.remoteAddress
        || '';

      const orderId = await this.qrTokenService.verifyToken(token, clientIp);
      const order = await this.ordersService.findOneById(orderId);

      if (!order) {
        return responseHelper(
          response,
          HttpStatus.NOT_FOUND,
          ServerErrors.ORDERS.NOT_FOUND,
          null,
          null,
          null,
        );
      }

      const updateData = {
        status: body.status,
        updatedAt: new Date(),
      };

      const updatedOrder = await this.ordersService.updateOrderStatus(
        orderId,
        updateData,
      );

      return responseHelper(
        response,
        HttpStatus.OK,
        ServerSuccess.ORDERS.UPDATED,
        updatedOrder,
        null,
        null,
      );
    } catch (error) {
      exceptionHandling(error);
    }
  }
}
