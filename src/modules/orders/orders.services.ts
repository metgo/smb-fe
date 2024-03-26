import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { differenceInDays, subDays } from 'date-fns';
import mongoose, { Model } from 'mongoose';

import { calculateTotalAmount } from 'src/common/calculate-amounts';
import { ServerErrors } from 'src/common/constant';
import { Currency, Locale, PaymentStatus } from 'src/common/enum';
import {
  EnglishTemplate,
  HebrewTemplate,
} from 'src/common/mailchimp/templateId';
import { paginationConfig } from 'src/common/pagination.config';
import { calculateGrowthPercentage } from 'src/common/utils/calculate-growth-percentage';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldNames,
  findOneById,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { BusinessService } from 'src/modules/business/services/business.service';
import { DMOService } from 'src/modules/dmo/dmo.service';
import { UpdateOrderDto } from 'src/modules/orders/dto/update-order.dto';
import { GetAllOrdersInterface } from 'src/modules/orders/interface/get-all-orders.interface';
import { GetOrdersStatsQuery } from 'src/modules/orders/queries';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { ProductsService } from 'src/modules/products/products.services';
import { UserType } from 'src/modules/users/users.type';
import { CreateVoucherCommand } from 'src/modules/vouchers/interface';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { OrderStatus, PaymentMode } from 'src/modules/orders/orders.type';
import { OrderProductService } from 'src/modules/order-product/order-product.services';
import { PaymentsService } from 'src/services/payments/payments.service';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
    private readonly businessService: BusinessService,
    private readonly dmoService: DMOService,
    private readonly mailchimpService: MailChimpService,
    private readonly productsService: ProductsService,
    private readonly orderProductService: OrderProductService,
    @Inject(forwardRef(() => VoucherService))
    private readonly voucherService: VoucherService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
  ) {}

  async create(command: CreateVoucherCommand): Promise<any> {
    try {
      const {
        loggedInUserId,
        body,
        redeemedVouchers,
        totalAmount,
        actualAmountOfProduct,
        identifierId,
      } = command;

      if (totalAmount <= 0) {
        const newOrder = new this.OrderModel({
          ...body,
          voucher: redeemedVouchers,
          userId: loggedInUserId ?? null,
          createdBy: loggedInUserId ?? null,
          paymentStatus: PaymentStatus.SUCCESS,
          identifierId: identifierId || null,
          status: OrderStatus.PROCESSING,
          creditCardPayment: totalAmount,
          paymentMode: [PaymentMode.VOUCHER],
          totalAmount: actualAmountOfProduct,
        });

        const order = await newOrder.save();
        await Promise.all(
          order.products.map(async product => {
            await this.orderProductService.create({
              productId: product.id,
              quantity: product.quantity,
              loggedInUserId,
              orderId: order.id,
              email: order.email,
            });
          }),
        );

        const [getProductInformation, businessDetails] = await Promise.all([
          this.productsService.getProductInformationForOrders(body.products),
          this.businessService.findBusinessEmailByIds(order.businessId),
        ]);

        await this.mailchimpService.sendTransactionalEmail({
          to: order.email,
          templatedId:
            body?.languagePreference === Locale.HEBREW
              ? HebrewTemplate.OrderConfirmationForClient
              : EnglishTemplate.OrderConfirmationForClient,
          mergeVars: {
            BUYERNAME: order.firstName,
            BUSINESSNAME: businessDetails[0].name || '',
            PRODUCTNAME: getProductInformation[0].name,
            QUANTITY: body.products[0].quantity,
            COST: getProductInformation[0].price.sellingPrice,
            TOTALAMOUNT: order.totalAmount,
            BUSINESSPHONE:
              `${businessDetails[0]?.countryCode}-${businessDetails[0]?.phoneNumber}`
              || '',
            BUSINESSEMAIL: businessDetails[0].busiEmail || '',
            BUSINESSADDRESS: businessDetails[0]?.address?.location || '',
          },
        });

        // SEND TO BUSINESS OWNER
        await Promise.all(
          businessDetails.map(async business => {
            if (!business?.busiEmail) return;
            await this.mailchimpService.sendTransactionalEmail({
              to: business.busiEmail,
              templatedId:
                body?.languagePreference === Locale.HEBREW
                  ? HebrewTemplate.OrderReceivedForBusiness
                  : EnglishTemplate.OrderReceivedForBusiness,
              mergeVars: {
                BUSINESSNAME: business?.name || '',
                PRODUCTNAME: getProductInformation[0].name,
                QUANTITY: body.products[0].quantity,
                COST: getProductInformation[0].price.sellingPrice,
                TOTALAMOUNT: order.totalAmount,
                BUYERNAME: `${body.firstName} ${body.lastName}`,
                BUYERPHONE: `${body?.countryCode}-${body.phone}`,
                BUYEREMAIL: body.email,
                BUYERADDRESS: body.address,
              },
            });
          }),
        );

        return;
      }

      const newOrder = new this.OrderModel({
        ...body,
        voucher: redeemedVouchers,
        userId: loggedInUserId ?? null,
        createdBy: loggedInUserId ?? null,
        paymentStatus: PaymentStatus.PENDING,
        identifierId: identifierId || null,
        creditCardPayment: totalAmount,
        paymentMode:
          totalAmount === actualAmountOfProduct
            ? [PaymentMode.CARD]
            : [PaymentMode.CARD, PaymentMode.VOUCHER],
        totalAmount: actualAmountOfProduct,
      });

      const order = await newOrder.save();

      await Promise.all(
        order.products.map(async product => {
          await this.orderProductService.create({
            productId: product.id,
            quantity: product.quantity,
            loggedInUserId,
            orderId: order.id,
            email: order.email,
          });
        }),
      );

      const link = await this.paymentService.generateLink({
        amount: totalAmount,
        currency: Currency.ILS,
        purpose: PaymentPurpose.ORDER,
        id: order.id,
        customerEmail: body.email,
        customerName: `${body.firstName} ${body.lastName}`,
        languagePreference: body?.languagePreference || Locale.ENGLISH,
      });

      return [link];
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async updateAfterPaymentSuccess(orderId: string): Promise<Order> {
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

  async updateAfterPaymentFailure(orderId: string): Promise<Order> {
    const orderDetail = await findOneById<Order>(this.OrderModel, orderId);
    const updatedField = {
      paymentStatus: PaymentStatus.FAILURE,
      status: OrderStatus.CANCELED,
    };

    if (orderDetail?.voucher && orderDetail?.voucher?.length) {
      // update vouchers detail and add the deducted voucher amounts
      await this.voucherService.updateAmountAfterOrderFailed(
        orderDetail.voucher,
      );
    }

    const updateOrder = await updateById<Order>(
      this.OrderModel,
      orderId,
      updatedField,
    );
    return updateOrder;
  }

  async update(
    loggedInUserId: string,
    id: string,
    body: UpdateOrderDto,
  ): Promise<Order> {
    try {
      const updatedField = {
        ...body,
        updatedBy: loggedInUserId,
        updatedAt: new Date(),
      };
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
      const order = await findOneByFieldNames<Order>(this.OrderModel, {
        _id: id,
      });

      if (!order) {
        throw new NotFoundException(ServerErrors.ORDERS.NOT_FOUND);
      }

      return order;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findMyOrderInfo(
    loggedInUser: LoggedInUserInterface,
    orderId: string,
  ): Promise<Order> {
    try {
      const order = await this.checkIfAllowed(loggedInUser, orderId);
      return order;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async updateOrder(
    loggedInUser: LoggedInUserInterface,
    orderId: string,
    body: UpdateOrderDto,
  ): Promise<Order> {
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

  async findAll(queries: GetAllOrdersInterface) {
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
        $text: {
          $search: search,
          $caseSensitive: false,
          $diacriticSensitive: false,
        },
      };
    }

    if (queries.myOrder) {
      findQuery = { ...findQuery, userId: queries.loggedInUser.id };
    }

    if (queries.loggedInUser.role === UserType.DMOADMIN) {
      const dmoId = await this.dmoService.findDMOByUserID(queries.loggedInUser.id);

      const orders = await this.orderProductService.findAllForDmo(
        findQuery,
        dmoId,
        queryPage,
        queryLimit,
      );
      return orders;
    }

    const orders = await queryhandler<Order>(this.OrderModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
    });
    return orders;
  }

  private async checkIfAllowed(
    loggedInUser: any,
    orderId: string,
  ): Promise<Order> {
    const allowedRoles = [UserType.ADMIN, UserType.DMO, UserType.SUPERADMIN];
    const order = await this.findOne(orderId);

    if (
      !allowedRoles.includes(loggedInUser.role)
      && !new mongoose.Types.ObjectId(loggedInUser.id).equals(order.userId)
    ) {
      throw new ForbiddenException(ServerErrors.FORBIDDEN);
    }

    return order;
  }

  async processVouchers(
    loggedInUserId: string | null,
    voucherIds,
    totalAmountOfProduct,
  ) {
    let voucherInfo = [];
    const processVouchers = async (
      vouchers,
      index = 0,
      initialRedeemedAmount = 0,
    ) => {
      if (
        index >= vouchers.length
        || (index > 0 && initialRedeemedAmount === 0)
      ) {
        return;
      }

      const voucher = vouchers[index];
      const { amountToBeRedeemed: updateRedeemedAmount, redeemedAmount }
        = await this.voucherService.updateVoucherAmount(
          loggedInUserId,
          voucher.id,
          index === 0 ? totalAmountOfProduct : initialRedeemedAmount,
        );

      voucherInfo = [
        ...voucherInfo,
        {
          id: voucher.id,
          redeemedAmount,
        },
      ];

      await processVouchers(vouchers, index + 1, updateRedeemedAmount);
    };

    await processVouchers(voucherIds);
    voucherInfo.filter(Boolean);

    return voucherInfo;
  }

  async getStats(
    loggedInUser: LoggedInUserInterface,
    query: GetOrdersStatsQuery,
  ) {
    try {
      const { startDate, endDate } = query;

      const select = disSelect;

      let findQuery: any = { paymentStatus: PaymentStatus.SUCCESS };

      if (loggedInUser.role === UserType.TRAVELLER) {
        findQuery = {
          ...findQuery,
          userId: loggedInUser.id,
        };
      }
      let createdFindQuery: any = {
        ...findQuery,
        isDeleted: false,
      };

      if (startDate && endDate) {
        const createdStartDate = new Date(startDate);
        const createdEndDate = new Date(endDate);

        if (createdStartDate >= createdEndDate) {
          throw new BadRequestException(
            `Created ${ServerErrors.DATE_IS_NOT_LESS}`,
          );
        }

        const difference = differenceInDays(createdEndDate, createdStartDate);

        const newStartDate = subDays(createdStartDate, difference);

        createdFindQuery = {
          ...createdFindQuery,
          createdAt: {
            $gte: createdStartDate,
            $lte: createdEndDate,
          },
        };

        const pastCreatedFindQuery = {
          ...createdFindQuery,
          createdAt: {
            $gte: newStartDate,
            $lte: createdStartDate,
          },
        };

        const [newCreatedOrders, prevCreatedOrders] = await Promise.all([
          queryhandler<Order>(this.OrderModel, {
            findQuery: createdFindQuery,
            select,
          }),

          queryhandler<Order>(this.OrderModel, {
            findQuery: pastCreatedFindQuery,
            select,
          }),
        ]);

        const newOrdersCount = newCreatedOrders.totalData;
        const prevOrdersCount = prevCreatedOrders.totalData;

        const [totalAmount, totalAmountPrev, amountPaidByCard]
          = await Promise.all([
            calculateTotalAmount('totalAmount', newCreatedOrders.data),
            calculateTotalAmount('totalAmount', prevCreatedOrders.data),
            calculateTotalAmount('creditCardPayment', newCreatedOrders.data),
          ]);

        const amountPaidByVouchers = totalAmount - amountPaidByCard;

        return {
          newOrdersCount,
          prevOrdersCount,
          isGrowthInCount: newOrdersCount > prevOrdersCount,
          countGrowthPercentage: calculateGrowthPercentage(
            prevOrdersCount,
            newOrdersCount,
          ),
          totalAmount,
          totalAmountPrev,
          isGrowthInAmount: totalAmount > totalAmountPrev,
          orderAmountGrowthPercentage: calculateGrowthPercentage(
            totalAmountPrev,
            totalAmount,
          ),
          amountPaidByCard,
          amountPaidByVouchers,
        };
      }

      const newOrders = await queryhandler<Order>(this.OrderModel, {
        findQuery: createdFindQuery,
        select,
      });

      const [totalAmount, amountPaidByCard] = await Promise.all([
        calculateTotalAmount('totalAmount', newOrders.data),
        calculateTotalAmount('creditCardPayment', newOrders.data),
      ]);

      return {
        newOrdersNo: newOrders.totalData,
        totalAmount,
        amountPaidByCard,
        amountPaidByVouchers: totalAmount - amountPaidByCard,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
