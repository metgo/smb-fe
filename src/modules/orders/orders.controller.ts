import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { OrdersService } from 'src/modules/orders/orders.services';
import { CreateOrderDto } from './dto';
import { CreateMiniSiteOrderCommand } from './commands/create-mini-site-order.command';

@Controller()
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private readonly commandBus: CommandBus,
  ) {}

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

  @ApiEndpoint({
    tags: ['Orders'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.ORDERS.CREATED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Create order detail for mini site',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('orders/mini-site')
  async createOrderForMiniSite(@Body() body: CreateOrderDto, @Req() req) {
    return await this.commandBus.execute(
      new CreateMiniSiteOrderCommand(body, req?.user),
    );
  }
}
