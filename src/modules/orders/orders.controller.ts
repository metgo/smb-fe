import {
  Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { CreateOrderDto } from 'src/modules/orders/dto/create-order.dto';
import { UpdateOrderDto } from 'src/modules/orders/dto/update-order.dto';
import { OrdersService } from 'src/modules/orders/orders.services';
import { IOrderQuery } from 'src/modules/orders/orders.type';
import { UserType } from 'src/modules/users/users.type';
import { ProductsService } from '../products/products.services';
import { calculateTotalAmount } from 'src/common/calculate-total-amount';

@Controller()
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private productService: ProductsService,
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
    const productIds = body.products.map(product => product.id);

    console.log(productIds);
    const productsFromDB = await this.productService.findManyById(productIds);
    console.log(productsFromDB);
    const totalAmount = await calculateTotalAmount(body.products, productsFromDB);
    console.log({ totalAmount });
    const order = await this.ordersService.create(req.user ? req.user.id : null, body, totalAmount);
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
    const order = await this.ordersService.findMyOrderInfo(req.user, orderId);
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
    const orders = await this.ordersService.findAll({
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
  @Get('all-orders')
  async getAllOrders(
    @Query() query: IOrderQuery,
    @Res() response: Response,
  ) {
    const orders = await this.ordersService.findAll({
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
    const order = await this.ordersService.updateOrder(
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
