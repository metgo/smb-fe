import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OrderDto } from 'src/modules/order/dto/order.dto';
import { Order } from 'src/modules/order/schema/order.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
  ) {}

  async create(loggedInUserId: string, body: OrderDto): Promise<Order> {
    const newOrder = new this.OrderModel({
      ...body,
      userId: loggedInUserId,
      createdBy: loggedInUserId,
    });

    await newOrder.save();
    return newOrder;
  }
}
