import {
  Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { CreateOrderDto } from 'src/modules/order/dto/create-order.dto';
import { UpdateOrderDto } from 'src/modules/order/dto/update-order.dto';
import { OrderService } from 'src/modules/order/order.services';
import { IOrderQuery } from 'src/modules/order/order.type';
import { UserType } from 'src/modules/users/users.type';

@Controller()
export class OrderController {
  constructor(
      private orderService: OrderService,
  ) {}

  @ApiEndpoint({
    tags: ['Products', 'Orders'],
    response: { status: HttpStatus.CREATED, description: ServerSuccess.ORDERS.CREATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Create order detail',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('orders')
  async createOrder(
    @Body() body: CreateOrderDto,
    @Req() req,
    @Res() response: Response,
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

  @ApiEndpoint({
    tags: ['Products', 'Orders'],
    response: { status: HttpStatus.OK, description: ServerSuccess.ORDERS.LISTED },
    operation: 'Get detail of a order',
    params: [{
      name: 'orderId',
      type: 'string',
      required: true,
    }],
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('orders/:orderId')
  async getOrderDetails(
    @Param('orderId') orderId: string,
    @Req() req,
    @Res() response: Response,
  ) {
    const order = await this.orderService.findMyOrderInfo(req.user, orderId);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ORDERS.LISTED,
      order,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Products', 'Orders'],
    response: { status: HttpStatus.OK, description: ServerSuccess.ORDERS.LISTED },
    operation: 'Get my orders',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('my-orders')
  async getMyOrders(
    @Query() query: IOrderQuery,
    @Req() req,
    @Res() response: Response,
  ) {
    const orders = await this.orderService.findAll({
      query,
      myOrder: true,
      loggedInUser: req.user.id,
    });
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ORDERS.LISTED,
      orders,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Products', 'Orders'],
    response: { status: HttpStatus.OK, description: ServerSuccess.ORDERS.LISTED },
    operation: 'Get all orders',
    softBlockExtraDtoFields: true,
  })
  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('orders')
  async getAllOrders(
    @Query() query: IOrderQuery,
    @Res() response: Response,
  ) {
    const orders = await this.orderService.findAll({
      query,
    });
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ORDERS.LISTED,
      orders,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Products', 'Orders'],
    response: { status: HttpStatus.OK, description: ServerSuccess.ORDERS.UPDATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Update order status',
    params: [{
      name: 'orderId',
      required: true,
      type: 'string',
    }],
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('orders/:orderId')
  async updateOrder(
    @Param('orderId') orderId: string,
    @Body() body: UpdateOrderDto,
    @Req() req,
    @Res() response: Response,
  ) {
    const order = await this.orderService.updateOrder(
      req.user,
      orderId,
      body,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ORDERS.UPDATED,
      order,
      null,
      null,
    );
  }
}
