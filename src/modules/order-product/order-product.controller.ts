import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { OrderProductService } from 'src/modules/order-product/order-product.services';
import { GetAllOrdersDetailsQuery } from 'src/modules/order-product/queries/get-order-details.query';
import { GetOrdersSummaryQuery } from 'src/modules/order-product/queries/get-order-summary.query';

@Controller()
export class OrderProductController {
  constructor(private orderProductServices: OrderProductService) {}

  @ApiEndpoint({
    tags: ['Orders'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ORDERS.LISTED,
    },
    operation: 'Get Orders Summary',
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('orders-summary')
  async getMyOrders(
    @Query() query: GetOrdersSummaryQuery,
    @Req() req,
    @Res() response: Response,
  ) {
    const orderSummary = await this.orderProductServices.getOrderSummary(
      req.user,
      query,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ORDERS.LISTED,
      orderSummary,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Products', 'Orders'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ORDERS.LISTED,
    },
    operation: 'Get all orders',
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('all-orders')
  async getAllOrders(
    @Query() query: GetAllOrdersDetailsQuery,
    @Req() req,
    @Res() response: Response,
  ) {
    const orders = await this.orderProductServices.findAllOrderDetails(
      req.user,
      query,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ORDERS.LISTED,
      orders,
      null,
      null,
    );
  }
}
