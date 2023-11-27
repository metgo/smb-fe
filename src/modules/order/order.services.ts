import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { findOneByFieldNames, queryhandler } from 'src/core/helper/query-helper';
import { CreateOrderDto } from 'src/modules/order/dto/create-order.dto';
import { UpdateOrderDto } from 'src/modules/order/dto/update-order.dto';
import { FindOrders } from 'src/modules/order/order.type';
import { Order } from 'src/modules/order/schema/order.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
  ) {}

  async create(loggedInUserId: string, body: CreateOrderDto): Promise<Order> {
    const newOrder = new this.OrderModel({
      ...body,
      userId: loggedInUserId,
      createdBy: loggedInUserId,
    });

    await newOrder.save();
    return newOrder;
  }

  async update(loggedInUserId: string, id:string, body: UpdateOrderDto): Promise<Order> {
    const updatedField = { ...body, updatedBy: loggedInUserId, updatedAt: new Date() };
    const updateOrder = await this.OrderModel.findOneAndUpdate(
      { _id: id },
      { updatedField },
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
}
