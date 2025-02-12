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
// import { ExternalApiGuard } from 'src/core/guards/authorization/external-api-guards';
// import { ExternalApiPostQuery } from 'src/common/query-handler/external-api.query';
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

  // @ApiEndpoint({
  //   tags: ['Order'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.ORDERS.LISTED,
  //   },
  //   operation: 'Get detail of a order',
  //   params: [
  //     {
  //       name: 'orderId',
  //       type: 'string',
  //       required: true,
  //     },
  //   ],
  //   noAuthToken: true,
  // })
  // @UseGuards(JwtAuthGuard)
  // @HttpCode(HttpStatus.OK)
  // @Get('orders/:orderId')
  // async getOrderDetails(
  //   @Param('orderId') orderId: string,
  //   @Req() req,
  //   @Res() response: Response,
  // ) {
  //   const order = await this.ordersService.findMyOrderInfo(req.user, orderId);
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.ORDERS.LISTED,
  //     order,
  //     null,
  //     null,
  //   );
  // }

  // @ApiEndpoint({
  //   tags: ['Order'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.ORDERS.LISTED,
  //   },
  //   operation: 'Get my orders',
  //   softBlockExtraDtoFields: true,
  //   noAuthToken: true,
  // })
  // @UseGuards(JwtAuthGuard)
  // @HttpCode(HttpStatus.OK)
  // @Get('my-orders')
  // async getMyOrders(
  //   @Query() query: GetAllOrdersQuery,
  //   @Req() req,
  //   @Res() response: Response,
  // ) {
  //   const orders = await this.ordersService.findAll({
  //     query,
  //     myOrder: true,
  //     loggedInUser: req.user,
  //   });
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.ORDERS.LISTED,
  //     orders,
  //     null,
  //     null,
  //   );
  // }

  // @ApiEndpoint({
  //   tags: ['Order Process'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.ORDERS.UPDATED,
  //   },
  //   softBlockExtraDtoFields: true,
  //   operation: 'Update order status step [5]',
  //   params: [
  //     {
  //       name: 'orderId',
  //       required: true,
  //       type: 'string',
  //     },
  //   ],
  // })
  // @HttpCode(HttpStatus.OK)
  // @Patch('orders/:orderId')
  // async updateOrder(
  //   @Param('orderId') orderId: string,
  //   @Body() body: UpdateOrderDto,
  //   @Req() req,
  //   @Res() response: Response,
  // ) {
  //   const order = await this.ordersService.updateOrder(orderId, body, req.user);
  //   return responseHelper(
  //     response,
  //     HttpStatus.OK,
  //     ServerSuccess.ORDERS.UPDATED,
  //     order,
  //     null,
  //     null,
  //   );
  // }

  // shallev
  // @ApiEndpoint({
  //   tags: ['Order Process'],
  //   operation: 'Start to checkout status step [2]',
  //   response: {
  //     status: HttpStatus.CREATED,
  //     description: ServerSuccess.ORDERS.CREATED,
  //   },
  //   softBlockExtraDtoFields: true,
  // })
  // @Post('checkout')
  // async startCheckut(
  //   @Body() body: StartCheckoutDto,
  //   @Req() req,
  //   @Res() response: Response,
  // ) {
  //   const order = await this.ordersService.processCheckout(body, req?.user);

  //   return responseHelper(
  //     response,
  //     HttpStatus.CREATED,
  //     ServerSuccess.ORDERS.CREATED,
  //     order,
  //     null,
  //     null,
  //   );
  // }
}
