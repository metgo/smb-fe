import {
  BadRequestException,
  Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { calculateTotalAmount } from 'src/common/calculate-total-amount';
import { ServerSuccess } from 'src/common/constant';
import { ExternalApiPostQuery } from 'src/common/query-handler/externalapi-post.query';
import { sortByPriorityAndHighest } from 'src/common/sort-priority-and-highest';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ExternalApiGuard } from 'src/core/guards/authorization/external-api-guards';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { CreateOrderDto } from 'src/modules/orders/dto/create-order.dto';
import { FilterQuery } from 'src/modules/orders/dto/query.dto';
import { UpdateOrderDto } from 'src/modules/orders/dto/update-order.dto';
import { OrdersService } from 'src/modules/orders/orders.services';
import { ProductsService } from 'src/modules/products/products.services';
import { UserType } from 'src/modules/users/users.type';
import { VoucherService } from 'src/modules/vouchers/voucher.service';

@Controller()
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private productService: ProductsService,
    private voucherService: VoucherService,
  ) {}

  @ApiEndpoint({
    tags: ['Products', 'Orders'],
    response: { status: HttpStatus.CREATED, description: ServerSuccess.ORDERS.CREATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Create order detail',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('orders')
  async createOrder(
    @Body() body: CreateOrderDto,
    @Req() req,
    @Res() response: Response,
  ) {
    if (!req.user && !body.email) {
      throw new BadRequestException('Email is required');
    }
    let voucherIds;
    const productIds = body.products.map(product => product.id);
    if (body.voucher) voucherIds = body.voucher.map(voucher => voucher.id);

    const productsFromDB = await this.productService.findManyById(productIds);
    let totalAmount:number = await calculateTotalAmount(body.products, productsFromDB);

    let vouchers;
    if (voucherIds) vouchers = await this.voucherService.findByIds(voucherIds);
    let sortedVoucher;
    if (voucherIds) sortedVoucher = sortByPriorityAndHighest(totalAmount, vouchers);
    let voucher;
    if (sortedVoucher) {
      voucher = await this.ordersService.processVouchers(
        req.user ? req.user.id : null,
        sortedVoucher,
        totalAmount,
      );
    }
    if (voucher) {
      const redemeAmount = voucher.reduce((total, item) => total + item.redeemedAmount, 0);
      totalAmount -= redemeAmount;
    }
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
    noAuthToken: true,
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
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('my-orders')
  async getMyOrders(
    @Query() query: FilterQuery,
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
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('all-orders')
  async getAllOrders(
    @Query() query: FilterQuery,
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

  @ApiEndpoint({
    tags: ['Orders', 'External Api'],
    response: { status: 200, description: ServerSuccess.ORDERS.CREATED },
    softBlockExtraDtoFields: true,
  })
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Post('/externalapi/orders')
  async createOrderForExternalApi(
    @Body() body: CreateOrderDto,
    @Query() query: ExternalApiPostQuery,
    @Req() req,
    @Res() response: Response,
  ) {
    let voucherIds;
    let vouchers;
    let sortedVoucher;
    let voucher;

    const productIds = body.products.map(product => product.id);
    const productsFromDB = await this.productService.findManyById(productIds);
    let totalAmount:number = await calculateTotalAmount(body.products, productsFromDB);

    if (body.voucher) voucherIds = body.voucher.map(item => item.id);

    if (voucherIds) {
      vouchers = await this.voucherService.findByIds(voucherIds);
      sortedVoucher = sortByPriorityAndHighest(totalAmount, vouchers);

      if (sortedVoucher) {
        voucher = await this.ordersService.processVouchers(
          req.user.id,
          sortedVoucher,
          totalAmount,
        );
      }
    }

    if (voucher) {
      const redemeAmount = voucher.reduce((total: number, item) => total + item.redeemedAmount, 0);
      totalAmount -= redemeAmount;
    }

    const order = await this.ordersService.create(
      req.user.id,
      body,
      totalAmount,
      query.identifierId,
    );
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
