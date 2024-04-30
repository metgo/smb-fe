import {
  Body,
  Controller,
  Get,
  HttpCode,
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

import { calculateTotalAmount } from 'src/common/calculate-products-total-amount';
import { ServerSuccess } from 'src/common/constant';
import { ExternalApiPostQuery } from 'src/common/query-handler/externalapi-post.query';
import { sortByPriorityAndHighest } from 'src/common/sort-priority-and-highest';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ExternalApiGuard } from 'src/core/guards/authorization/external-api-guards';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import {
  CreateOrderExternalApiDto,
  CreateOrderDto,
  UpdateOrderDto,
} from 'src/modules/orders/dto';
import {
  GetAllOrdersQuery,
  GetOrdersStatsQuery,
} from 'src/modules/orders/queries';
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
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.ORDERS.CREATED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Create order detail',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @Post('orders')
  async createOrder(
    @Body() body: CreateOrderDto,
    @Req() req,
    @Res() response: Response,
  ) {
    try {
      const productIds = body.products.map(product => product.id);
      const productsFromDB = await this.productService.findManyById(productIds);

      let totalAmountToPay: number = await calculateTotalAmount(
        body.products,
        productsFromDB,
      );
      const actualAmountOfProduct = totalAmountToPay;

      let redeemedVouchers;
      if (body?.voucher?.length) {
        const voucherIds = body.voucher.map(voucher => voucher.id);
        const vouchers = await this.voucherService.findByValidIds(voucherIds);

        if (vouchers?.length) {
          const sortedVoucher = sortByPriorityAndHighest(
            totalAmountToPay,
            vouchers,
          );

          if (sortedVoucher?.length) {
            redeemedVouchers = await this.ordersService.processVouchers(
              req?.user?.id ?? null,
              sortedVoucher,
              totalAmountToPay,
            );

            if (redeemedVouchers?.length) {
              const redeemedAmount = redeemedVouchers.reduce(
                (total, item) => total + item.redeemedAmount,
                0,
              );
              totalAmountToPay -= redeemedAmount;
            }
          }
        }
      }

      const order = await this.ordersService.create({
        loggedInUserId: req?.user?.id || null,
        body,
        redeemedVouchers,
        totalAmount: totalAmountToPay,
        actualAmountOfProduct,
      });

      return responseHelper(
        response,
        HttpStatus.CREATED,
        ServerSuccess.ORDERS.CREATED,
        order,
        null,
        null,
      );
    } catch (err) {
      exceptionHandling(err);
    }
  }

  @ApiEndpoint({
    tags: ['Products', 'Orders'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ORDERS.LISTED,
    },
    operation: 'Get detail of a order',
    params: [
      {
        name: 'orderId',
        type: 'string',
        required: true,
      },
    ],
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
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ORDERS.LISTED,
    },
    operation: 'Get my orders',
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('my-orders')
  async getMyOrders(
    @Query() query: GetAllOrdersQuery,
    @Req() req,
    @Res() response: Response,
  ) {
    const orders = await this.ordersService.findAll({
      query,
      myOrder: true,
      loggedInUser: req.user,
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
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ORDERS.LISTED,
    },
    operation: 'Get all orders',
    softBlockExtraDtoFields: true,
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN, UserType.DMO, UserType.DMOADMIN)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('all-orders-cache')
  async getAllOrders(
    @Query() query: GetAllOrdersQuery,
    @Req() req,
    @Res() response: Response,
  ) {
    const orders = await this.ordersService.findAll({
      query,
      loggedInUser: req.user,
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
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ORDERS.UPDATED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Update order status',
    params: [
      {
        name: 'orderId',
        required: true,
        type: 'string',
      },
    ],
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
    const order = await this.ordersService.updateOrder(req.user, orderId, body);
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
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @UseGuards(ExternalApiGuard)
  @Post('/externalapi/orders')
  async createOrderForExternalApi(
    @Body() body: CreateOrderExternalApiDto,
    @Query() query: ExternalApiPostQuery,
    @Req() req,
    @Res() response: Response,
  ) {
    try {
      const productIds = body.products.map(product => product.id);
      const productsFromDB = await this.productService.findManyById(productIds);

      let totalAmountToPay: number = await calculateTotalAmount(
        body.products,
        productsFromDB,
      );
      const actualAmountOfProduct = totalAmountToPay;

      let redeemedVouchers;
      if (body?.voucher?.length) {
        const voucherIds = body.voucher.map(voucher => voucher.id);
        const vouchers = await this.voucherService.findByValidIds(voucherIds);

        if (vouchers?.length) {
          const sortedVoucher = sortByPriorityAndHighest(
            totalAmountToPay,
            vouchers,
          );

          if (sortedVoucher?.length) {
            redeemedVouchers = await this.ordersService.processVouchers(
              req.user.id,
              sortedVoucher,
              totalAmountToPay,
            );

            if (redeemedVouchers?.length) {
              const redeemedAmount = redeemedVouchers.reduce(
                (total: number, item) => total + item.redeemedAmount,
                0,
              );
              totalAmountToPay -= redeemedAmount;
            }
          }
        }
      }

      const order = await this.ordersService.create({
        loggedInUserId: req.user.id,
        body,
        redeemedVouchers,
        totalAmount: totalAmountToPay,
        actualAmountOfProduct,
        identifierId: query.identifierId,
      });

      return responseHelper(
        response,
        HttpStatus.CREATED,
        ServerSuccess.ORDERS.CREATED,
        order,
        null,
        null,
      );
    } catch (err) {
      exceptionHandling(err);
    }
  }

  @ApiEndpoint({
    tags: ['Orders'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ORDERS.LISTED,
    },
    noAuthToken: true,
  })
  @Roles(UserType.SUPERADMIN, UserType.TRAVELLER)
  @UseGuards(JwtAuthGuard)
  @Get('stats/orders-cached')
  async getBusinessStats(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetOrdersStatsQuery,
  ) {
    const orderStats = await this.ordersService.getStats(req.user, query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ORDERS.LISTED,
      orderStats,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Orders'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.ORDERS.LISTED,
    },
    noAuthToken: true,
  })
  @UseGuards(JwtAuthGuard)
  @Get('stats/orders')
  async getOrderStats(
    @Req() req,
    @Res() response: Response,
    @Query() query: GetOrdersStatsQuery,
  ) {
    const orderStats = await this.ordersService.getOrderStats(req.user, query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.ORDERS.LISTED,
      orderStats,
      null,
      null,
    );
  }
}
