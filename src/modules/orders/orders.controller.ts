import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { OrdersService } from 'src/modules/orders/orders.services';
import { CreateOrderDto } from './dto';

@Controller()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @ApiEndpoint({
    tags: ['Orders'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.ORDERS.CREATED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Create order detail',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('orders')
  async createOrder(@Body() body: CreateOrderDto, @Req() req) {
    const orders = await this.ordersService.startCheckOutProcess(
      body,
      req?.user,
    );

    return orders;
  }
}
