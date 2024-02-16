/* eslint-disable consistent-return */
import {
  BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { Currency, Locale, PaymentStatus } from 'src/common/enum';
import { EnglishTemplate, HebrewTemplate } from 'src/common/mailchimp/templateId';
import { paginationConfig } from 'src/common/pagination.config';
import { sortByPriorityAndHighest } from 'src/common/sort-priority-and-highest';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldNames, findOneById, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { BusinessService } from 'src/modules/business/business.service';
import { CreateOrderDto } from 'src/modules/orders/dto/create-order.dto';
import { UpdateOrderDto } from 'src/modules/orders/dto/update-order.dto';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { ProductsService } from 'src/modules/products/products.services';
import { UserType } from 'src/modules/users/users.type';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { PaymentsService } from 'src/services/payments/payments.service';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { FindOrdersQuery, OrderStatus, PaymentMode } from 'src/modules/orders/orders.type';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
    private readonly businessService: BusinessService,
    private readonly mailchimpService: MailChimpService,
    private readonly productsService: ProductsService,
    @Inject(forwardRef(() => VoucherService))
    private readonly voucherService: VoucherService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
  ) {}

  async create(
    loggedInUser: LoggedInUserInterface | null,
    body: CreateOrderDto,
    totalAmount: number,
    actualAmountOfProduct:number,
    identifierId?:string,
  ): Promise<any> {
    try {
      if (totalAmount <= 0) {
        const newOrder = new this.OrderModel({
          ...body,
          userId: loggedInUser?.id ?? null,
          createdBy: loggedInUser?.id ?? null,
          paymentStatus: PaymentStatus.SUCCESS,
          identifierId: identifierId || null,
          status: OrderStatus.PROCESSING,
          creditCardPayment: totalAmount,
          paymentMode: [PaymentMode.VOUCHER],
          totalAmount: actualAmountOfProduct,
        });

        const order = await newOrder.save();

        const [getProductInformation, businessDetails] = await Promise.all([
          this.productsService.getProductInformationForOrders(body.products),
          this.businessService.findBusinessEmailByIds(order.businessId),
        ]);

        await this.mailchimpService.sendTransactionalEmail({
          to: order.email,
          templatedId: (loggedInUser?.languagePreference === Locale.HEBREW)
            ? HebrewTemplate.OrderConfirmationForClient
            : EnglishTemplate.OrderConfirmationForClient,
          mergeVars: {
            FNAME: order.firstName,
            BUYERNAME: businessDetails[0].name || '',
            PRODUCTNAME: getProductInformation[0].name,
            QUANTITY: body.products[0].quantity,
            COST: getProductInformation[0].price.sellingPrice,
            TOTALAMOUNT: order.totalAmount,
            PHONE: businessDetails[0].phoneNumber || '',
            EMAIL: businessDetails[0].busiEmail || '',
          },
        });

        // SEND TO BUSINESS OWNER
        await Promise.all(businessDetails.map(async business => {
          if (!business?.busiEmail) return;
          await this.mailchimpService.sendTransactionalEmail({
            to: business.busiEmail,
            templatedId: (loggedInUser?.languagePreference === Locale.HEBREW)
              ? HebrewTemplate.OrderReceivedForBusiness
              : EnglishTemplate.OrderReceivedForBusiness,
            mergeVars: {
              FNAME: order.firstName,
              BUYERNAME: business.name || '',
              PRODUCTNAME: getProductInformation[0].name,
              QUANTITY: body.products[0].quantity,
              COST: getProductInformation[0].price.sellingPrice,
              TOTALAMOUNT: order.totalAmount,
              PHONE: business.phoneNumber || '',
              EMAIL: business.busiEmail || '',
            },
          });
        }));

        return;
      }

      const newOrder = new this.OrderModel({
        ...body,
        userId: loggedInUser?.id ?? null,
        createdBy: loggedInUser?.id ?? null,
        paymentStatus: PaymentStatus.PENDING,
        identifierId: identifierId || null,
        creditCardPayment: totalAmount,
        paymentMode: totalAmount === actualAmountOfProduct ? [PaymentMode.CARD] : [PaymentMode.CARD, PaymentMode.VOUCHER],
        totalAmount: actualAmountOfProduct,
        voucher: totalAmount === actualAmountOfProduct ? [] : [...body.voucher],
      });

      const order = await newOrder.save();

      const link = await this.paymentService.generateLink({
        amount: totalAmount,
        currency: Currency.ILS,
        purpose: PaymentPurpose.ORDER,
        id: order.id,
        customerEmail: body.email,
        customerName: body.firstName,
        loggedInUserLanguagePreference: loggedInUser?.languagePreference || Locale.ENGLISH,
      });

      return [link];
    } catch (error) {
      if (error?.errors['businessId.0']?.kind) {
        throw new BadRequestException(`Business ${ServerErrors.INVALID_ID}`);
      }

      exceptionHandling(error);
    }
  }

  async updateOrderAfterPayment(orderId: string): Promise<Order> {
    const orderDetail = await findOneById<Order>(this.OrderModel, orderId);
    if (!orderDetail?.voucher || !orderDetail?.voucher?.length) {
      // deduct product count
      orderDetail.products.map(async product => {
        const productId = product.id.toString();
        await this.productsService.updateProductByFields(productId, {
          sold: product.quantity,
        });
      });

      const updatedField = {
        paymentStatus: PaymentStatus.SUCCESS,
        status: OrderStatus.PROCESSING,
      };

      const updateOrder = await updateById<Order>(
        this.OrderModel,
        orderId,
        updatedField,
      );
      return updateOrder;
    }
    // get voucherIds and sort by amount
    const arrayOfVoucherIds = orderDetail.voucher.map(obj => obj.id);
    const voucherIds = await this.voucherService.findByIds(arrayOfVoucherIds);

    const sortedVoucher = sortByPriorityAndHighest(orderDetail.totalAmount, voucherIds);

    // update vouchers detail and deduct voucher amounts
    const voucher = await this.processVouchers(orderDetail.createdBy, sortedVoucher, orderDetail.totalAmount);

    // deduct product count
    await Promise.all(orderDetail.products.map(async product => {
      const productId = product.id.toString();
      await this.productsService.updateProductByFields(productId, {
        sold: product.quantity,
      });
    }));

    const updatedField = {
      paymentStatus: PaymentStatus.SUCCESS,
      voucher,
      status: OrderStatus.PROCESSING,
    };

    const updateOrder = await updateById<Order>(
      this.OrderModel,
      orderId,
      updatedField,
    );
    return updateOrder;
  }

  async update(loggedInUserId: string, id:string, body: UpdateOrderDto): Promise<Order> {
    try {
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
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findOne(id: string): Promise<Order> {
    try {
      const order = await findOneByFieldNames<Order>(
        this.OrderModel,
        { _id: id },
      );

      if (!order) {
        throw new NotFoundException(ServerErrors.ORDERS.NOT_FOUND);
      }

      return order;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findMyOrderInfo(loggedInUser: LoggedInUserInterface, orderId: string) : Promise<Order> {
    try {
      const order = await this.checkIfAllowed(loggedInUser, orderId);
      return order;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async updateOrder(loggedInUser: LoggedInUserInterface, orderId: string, body: UpdateOrderDto): Promise<Order> {
    try {
      const order = await this.checkIfAllowed(loggedInUser, orderId);

      if (!order) {
        throw new ForbiddenException(ServerErrors.FORBIDDEN);
      }

      const updatedOrder = await this.update(loggedInUser.id, orderId, body);

      return updatedOrder;
    } catch (error) {
      exceptionHandling(error);
    }
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
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
      },
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
