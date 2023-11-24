import {
  Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { OrderDto } from 'src/modules/order/dto/order.dto';
import { OrderService } from 'src/modules/order/order.services';

@Controller('orders')
export class OrderController {
  constructor(
      private orderService: OrderService,
  ) {}

  @ApiEndpoint({
    tags: ['Products', 'Order'],
    response: { status: HttpStatus.CREATED, description: ServerSuccess.PRODUCTS.CREATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Create order detail',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('')
  async createOrder(
        @Req() req,
        @Res() response: Response,
        @Body() body: OrderDto,
  ) {
    const order = await this.orderService.create(req.user.id, body);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.ORDERS.CREATED,
      order,
      null,
      null,
    );
  }
}
