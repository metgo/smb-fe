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
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';

import { ServerSuccess, ServerErrors } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { exceptionHandling } from 'src/common/utils/exception-handling';
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

  @ApiEndpoint({
    tags: ['Orders'],
    response: {
      status: HttpStatus.OK,
      description: 'Get order by ID with vendor details',
    },
    operation: 'Get order details by ID',
  })
  @HttpCode(HttpStatus.OK)
  @Get('orders/:id')
  async getOrderById(
    @Param('id') orderId: string,
    @Res() response: Response,
  ) {
    try {
      const order = await this.ordersService.findOneById(
        orderId,
        'vendorId',
      );

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
}
