import {
  ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { Currency, PaymentStatus } from 'src/common/enum';
import { paginationConfig } from 'src/common/pagination.config';
import { sortByPriorityAndHighest } from 'src/common/sort-priority-and-highest';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldNames, findOneById, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { CreateOrderDto } from 'src/modules/orders/dto/create-order.dto';
import { UpdateOrderDto } from 'src/modules/orders/dto/update-order.dto';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { ProductsService } from 'src/modules/products/products.services';
import { UserType } from 'src/modules/users/users.type';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { PaymentsService } from 'src/services/payments/payments.service';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { FindOrdersQuery } from 'src/modules/orders/orders.type';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
    private readonly productsService: ProductsService,
    private readonly voucherService: VoucherService,
    private readonly paymentService: PaymentsService,
  ) {}

  async create(loggedInUserId: string | null, body: CreateOrderDto, totalAmount: number): Promise<any> {
    const newOrder = new this.OrderModel({
      ...body,
      userId: loggedInUserId || null,
      createdBy: loggedInUserId || null,
      paymentStatus: PaymentStatus.PENDING,
    });

    const order = await newOrder.save();
    let link = [];

    if (totalAmount !== 0) {
      link = await this.paymentService.generateLink(
        totalAmount,
        Currency.ILS,
        PaymentPurpose.ORDER,
        order.id,
      );
      return [link];
    }

    return link;
  }

  async updateOrderAfterPayment(orderId: string): Promise<Order> {
    const orderDetail = await findOneById<Order>(this.OrderModel, orderId);

    // get voucherIds and sort by amount
    const arrayOfVoucherIds = orderDetail.voucher.map(obj => obj.id);
    const voucherIds = await this.voucherService.findByIds(arrayOfVoucherIds);

    const sortedVoucher = sortByPriorityAndHighest(orderDetail.totalAmount, voucherIds);

    // update vouchers detail and deduct voucher amounts
    const voucher = await this.processVouchers(orderDetail.createdBy, sortedVoucher, orderDetail.totalAmount);

    // deduct product count
    orderDetail.products.map(async product => {
      const productId = product.id.toString();
      await this.productsService.updateProductByFields(productId, {
        sold: product.quantity,
      });
    });

    const updatedField = {
      paymentStatus: PaymentStatus.SUCCESS,
      voucher,
    };

    const updateOrder = await updateById<Order>(
      this.OrderModel,
      orderId,
      updatedField,
    );
    return updateOrder;
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

  async findAll(queries: FindOrdersQuery) : Promise<Order[]> {
    const {
      search, page, limit, ...query
    } = queries.query;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: any = query;
    const select = `${disSelect}`;

    if (search) {
      findQuery = {
        ...findQuery,
        $text: { $search: search, $caseSensitive: false, $diacriticSensitive: false },
      };
    }

    if (queries.myOrder) {
      findQuery = { ...findQuery, userId: queries.loggedInUser };
    }

    const orders = await queryhandler<Order>(
      this.OrderModel,
      findQuery,
      select,
      queryPage,
      queryLimit,
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

  async processVouchers(loggedInUserId: string | null, voucherIds, totalAmountOfProduct) {
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
