import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { sortByPriorityAndHighest } from 'src/common/sort-priority-and-highest';
import { findOneByFieldNames, queryhandler } from 'src/core/helper/query-helper';
import { CreateOrderDto } from 'src/modules/orders/dto/create-order.dto';
import { UpdateOrderDto } from 'src/modules/orders/dto/update-order.dto';
import { FindOrders } from 'src/modules/orders/orders.type';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { ProductsService } from 'src/modules/products/products.services';
import { UserType } from 'src/modules/users/users.type';
import { VoucherService } from 'src/modules/vouchers/voucher.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
    private readonly productsService: ProductsService,
    private readonly voucherService: VoucherService,
  ) {}

  async create(loggedInUserId: string, body: CreateOrderDto): Promise<Order> {
    // get voucherIds anc sort by amount
    const voucherIds = await this.voucherService.findByIds(body.voucher);

    const sortedVoucher = sortByPriorityAndHighest(body.totalAmount, voucherIds);

    // update vouchers detail and deduct voucher amounts
    const voucher = await this.processVouchers(loggedInUserId, sortedVoucher, body.totalAmount);

    // deduct product count
    body.productId.map(async (productId: string) => {
      await this.productsService.updateProductByFields(productId, {
        sold: 1,
        remaining: 1,
      });
    });

    const newOrder = new this.OrderModel({
      ...body,
      voucher,
      userId: loggedInUserId || null,
      createdBy: loggedInUserId || null,
    });

    await newOrder.save();
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
      throw new NotFoundException(ServerErrors.ORDERS.NOT_FOUND);
    }

    return updateOrder;
  }

  async findOne(id: string): Promise<Order> {
    const order = await findOneByFieldNames<Order>(
      this.OrderModel,
      { _id: id },
    );

    if (!order) {
      throw new NotFoundException(ServerErrors.ORDERS.NOT_FOUND);
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

  private async processVouchers(loggedInUserId: string, voucherIds, totalAmountOfProduct) {
    let voucherInfo = [];
    const processVouchers = async (vouchers, index = 0, initialRedeemedAmount = 0) => {
      if (index >= vouchers.length || (index > 0 && initialRedeemedAmount === 0)) {
        return;
      }

      const voucher = vouchers[index];
      const { amountToBeRedeemed: updateRedeemedAmount, redeemedAmount } = await this.voucherService.updateVoucherAmount(
        loggedInUserId,
        voucher.id,
        index === 0 ? totalAmountOfProduct : initialRedeemedAmount,
      );

      voucherInfo = [...voucherInfo, {
        id: voucher.id,
        redeemedAmount,
      }];

      await processVouchers(vouchers, index + 1, updateRedeemedAmount);
    };

    await processVouchers(voucherIds);
    voucherInfo.filter(Boolean);

    return voucherInfo;
  }
}
