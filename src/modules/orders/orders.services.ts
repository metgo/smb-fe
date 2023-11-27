import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { findOneByFieldNames, queryhandler } from 'src/core/helper/query-helper';
import { CreateOrderDto, Voucher } from 'src/modules/orders/dto/create-order.dto';
import { UpdateOrderDto } from 'src/modules/orders/dto/update-order.dto';
import { FindOrders } from 'src/modules/orders/orders.type';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { UserType } from 'src/modules/users/users.type';
import { VoucherService } from 'src/modules/vouchers/voucher.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
    private readonly voucherService: VoucherService,
  ) {}

  async create(loggedInUserId: string, body: CreateOrderDto): Promise<Order> {
    const newOrder = new this.OrderModel({
      ...body,
      userId: loggedInUserId,
      createdBy: loggedInUserId,
    });

    await newOrder.save();

    // update vouchers detail
    body.voucher.map(async (voucher: Voucher) => {
      await this.voucherService.updateVoucherAmount(loggedInUserId, voucher.id, voucher.redeemedAmount);
    });
    return newOrder;
  }

  async update(loggedInUserId: string, id:string, body: UpdateOrderDto): Promise<Order> {
    const updatedField = { ...body, updatedBy: loggedInUserId, updatedAt: new Date() };
    const updateOrder = await this.OrderModel.findOneAndUpdate(
      { _id: id },
      updatedField,
      { new: true },
    );

    if (!updateOrder) {
      throw new NotFoundException(ServerErrors.ORDER.NOT_FOUND);
    }

    return updateOrder;
  }

  async findOne(id: string): Promise<Order> {
    const order = await findOneByFieldNames<Order>(
      this.OrderModel,
      { _id: id },
    );

    if (!order) {
      throw new NotFoundException(ServerErrors.ORDER.NOT_FOUND);
    }

    return order;
  }

  async findMyOrderInfo(loggedInUser: any, orderId: string) : Promise<Order> {
    const order = await this.checkIfAllowed(loggedInUser, orderId);
    return order;
  }

  async updateOrder(loggedInUser: any, orderId: string, body: UpdateOrderDto): Promise<Order> {
    const order = await this.checkIfAllowed(loggedInUser, orderId);

    if (!order) {
      throw new ForbiddenException(ServerErrors.FORBIDDEN);
    }

    const updatedOrder = await this.update(loggedInUser.id, orderId, body);

    return updatedOrder;
  }

  async findAll(queries: FindOrders) : Promise<Order[]> {
    const {
      query, myOrder, loggedInUser,
    } = queries;

    let findQuery: any = query;
    let select: {};
    const page: number = query?.page || paginationConfig.page;
    const limit: number = query?.limit || paginationConfig.limit;

    if (myOrder) {
      findQuery = { ...query, userId: loggedInUser };
    }

    const orders = await queryhandler<Order>(
      this.OrderModel,
      findQuery,
      select,
      page,
      limit,
    );
    return orders;
  }

  private async checkIfAllowed(loggedInUser: any, orderId: string): Promise<Order> {
    const allowedRoles = [UserType.ADMIN, UserType.DMO, UserType.SUPERADMIN];
    const order = await this.findOne(orderId);

    if (
      !allowedRoles.includes(loggedInUser.role)
      && !(new mongoose.Types.ObjectId(loggedInUser.id).equals(order.userId))
    ) {
      throw new ForbiddenException(ServerErrors.FORBIDDEN);
    }

    return order;
  }
}
