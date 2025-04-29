import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { calculateProductsTotalAmount } from 'src/common/calculate-products-total-amount';
import { ServerErrors } from 'src/common/constant';
import {
  Currency, Locale, PaymentStatus, SortOrder,
} from 'src/common/enum';
import { DynamicEmailTemplate } from 'src/common/mailchimp/templateId';
import { paginationConfig } from 'src/common/pagination.config';
import { sortByPriorityAndHighest } from 'src/common/sort-priority-and-highest';
import { getCommonEmailFields } from 'src/common/utils/email/common-fields';
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
import { CartService } from 'src/modules/cart/cart.service';
import { CartProductResponse, CartStatus } from 'src/modules/cart/cart.types';
import { UpdateOrderDto } from 'src/modules/orders/dto/update-order.dto';
import { GetAllOrdersInterface } from 'src/modules/orders/interface/get-all-orders.interface';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { ProductsService } from 'src/modules/products/products.services';
import { UserType } from 'src/modules/users/users.type';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { CreateOrderDto } from 'src/modules/orders/dto';
import { OrderStatus, PaymentMode } from 'src/modules/orders/orders.type';
import { OrderProductService } from 'src/modules/order-product/order-product.services';

import { PaymentsService } from 'src/services/payments/payments.service';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { CreateOrderCommand } from 'src/modules/orders/interface/create-order.interface';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { QRCodeService } from 'src/services/qr-code/qr-code.service';
import { ConfigService } from 'src/services/config/config.service';
import { OrderProduct } from 'src/modules/order-product/schema/order-product.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { CampaignService } from 'src/modules/campaign/campaign.service';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
    private readonly businessService: BusinessService,
    private readonly mailchimpService: MailChimpService,
    private readonly productsService: ProductsService,
    private readonly orderProductService: OrderProductService,
    @Inject(forwardRef(() => VoucherService))
    private readonly voucherService: VoucherService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
    private readonly externalApiService: ExternalApiServices,
    private readonly cartService: CartService,
    private readonly qrCodeService: QRCodeService,
    private readonly configService: ConfigService,
    private readonly campaignService: CampaignService,
  ) {}

  async startCheckOutProcess(
    body: CreateOrderDto,
    loggedInUser?: LoggedInUserInterface,
  ): Promise<any> {
    try {
      if (!body.email && !body.phone) {
        throw new BadRequestException('Please enter email or phone');
      }
      const cartDetails = await this.cartService.findOneById(body.cartId);

      if (
        cartDetails?.status === CartStatus.TIME_OUT
        || cartDetails?.status === CartStatus.ORDER_PLACED
      ) {
        throw new BadRequestException(
          'This cart is no longer available to checkout',
        );
      }

      const productIds = cartDetails.product.map(product => product.id.toString());

      const productsFromDB = await this.productsService.findManyById(
        productIds,
      );

      const { payableAmount, cartItems, totalDeliveryFee }
        = await calculateProductsTotalAmount(
          cartDetails?.product,
          productsFromDB,
        );

      let totalAmountToPay = payableAmount;

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
            redeemedVouchers = await this.processVouchers(
              loggedInUser?.id ?? null,
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

      const products = productIds.map(id => ({ id }));

      const order = await this.createOrder({
        loggedInUser,
        body,
        redeemedVouchers,
        totalAmount: totalAmountToPay,
        payableAmount,
        products,
        productDetails: productsFromDB,
        cartItems,
        totalDeliveryFee,
      });

      return order;
    } catch (error) {
      this.logger.error('[ORDER]: FAILED TO CREATE ORDER', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  async createOrder(orderCommand: CreateOrderCommand): Promise<any> {
    const {
      loggedInUser,
      body,
      redeemedVouchers,
      totalAmount,
      payableAmount,
      products,
      productDetails,
      cartItems,
      totalDeliveryFee,
    } = orderCommand;

    try {
      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        body.campCode,
      );
      const externalApi = await this.externalApiService.findByIdentifierId(
        body.identifierId,
      );
      const newOrder = new this.OrderModel();

      const baseUrl
        = this.configService.get('ENV_NAME') === 'prod'
          ? 'https://console.metgo.app/'
          : 'https://stg.console.metgo.app/';

      const orderUrlWithUTM = `${baseUrl}orders/${newOrder._id.toString()}?utm_source=qr_code&utm_medium=tav8`;

      const qrCodeUrl = await this.qrCodeService.generateQRCode(
        orderUrlWithUTM,
        newOrder._id.toString(),
        loggedInUser,
      );

      const command = {
        ...body,
        _id: newOrder._id,
        externalApi,
        products,
        voucher: redeemedVouchers,
        userId: loggedInUser?.id ?? null,
        createdBy: loggedInUser?.id ?? null,
        createdAt: new Date(),
        creditCardPayment: totalAmount,
        totalAmount: payableAmount,
        deliveryFee: totalDeliveryFee,
        qrCodeUrl,
        campId: campDetails._id,
      };

      if (totalAmount <= 0) {
        return await this.createOrderWithNoCardComPayment(
          command,
          productDetails,
          cartItems,
          loggedInUser,
        );
      }

      return await this.createOrderWithCardComPayment(
        command,
        totalAmount,
        payableAmount,
        loggedInUser,
      );
    } catch (error) {
      this.logger.error('[EXTERNAL_API_ORDERS]: FAILED TO CREATE ORDER', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  async createOrderWithCardComPayment(
    command,
    totalAmount,
    payableAmount,
    loggedInUser,
  ) {
    const orderWithQR = new this.OrderModel({
      ...command,
      externalApiId: command?.externalApi?._id,
      paymentStatus: PaymentStatus.PENDING,
      paymentMode:
        totalAmount === payableAmount
          ? [PaymentMode.CARD]
          : [PaymentMode.CARD, PaymentMode.VOUCHER],
    });

    const order = await orderWithQR.save();
    await this.cartService.updateCartBeforePayment(
      command.cartId,
      order._id,
      loggedInUser,
    );
    this.logger.info(
      `[EXTERNAL_API_ORDERS]: CREATED-PAID BY ${order.paymentMode}`,
      { message: order },
    );

    const link = await this.paymentService.generateLink({
      amount: totalAmount,
      currency: Currency.ILS,
      purpose: PaymentPurpose.ORDER,
      id: order.id,
      customerEmail: command.email,
      customerName: command.firstName,
      languagePreference: command?.languagePreference || Locale.ENGLISH,
    });

    this.logger.info(
      `[EXTERNAL_API_ORDERS]: PAYMENT LINK SENT >> link: ${link}`,
    );

    return [link];
  }

  async createOrderWithNoCardComPayment(
    command,
    productInfo: Product[],
    cartItems: CartProductResponse[],
    loggedInUser: LoggedInUserInterface | null,
  ) {
    const orderWithQR = new this.OrderModel({
      ...command,
      externalApiId: command?.externalApi?._id,
      paymentDate: new Date(),
      paymentStatus: PaymentStatus.SUCCESS,
      status: OrderStatus.PROCESSING,
      paymentMode: [PaymentMode.VOUCHER],
    });

    const order = await orderWithQR.save();

    this.logger.info('[EXTERNAL_API_ORDERS]: CREATED-PAID BY VOUCHER', {
      message: order,
    });

    const orderProduct = await Promise.all(
      order.products.map(async product => {
        const cartItem = cartItems.find(
          item => item.id.toString() === product.id.toString(),
        );
        return await this.orderProductService.create({
          productId: cartItem?.id,
          quantity: cartItem?.quantity,
          email: cartItem?.email,
          countryCode: cartItem?.countryCode,
          phone: cartItem?.phone,
          firstName: cartItem?.firstName,
          lastName: cartItem?.lastName,
          deliveryFee: cartItem?.deliveryFee,
          deliveryMethod: cartItem?.deliveryMethod,
          deliveryArea: cartItem?.deliveryArea,
          deliveryPickupLocation: cartItem?.deliveryPickupLocation,
          houseNo: cartItem?.houseNo,
          apartment: cartItem?.apartment,
          city: cartItem?.city,
          street: cartItem?.street,
          isGift: cartItem?.isGift,
          additionalInfo: cartItem?.additionalInfo,
          amount: cartItem?.amount,
          orderId: order.id,
          loggedInUserId: loggedInUser?.id,
        });
      }),
    );
    await Promise.all([
      this.productsService.deductQuantity(cartItems),
      // update cart status
      this.cartService.updateCartPostCheckout(
        command.cartId,
        order._id,
        loggedInUser,
      ),
    ]);

    await this.sendEmailPostOrderPayment(
      productInfo,
      order,
      orderProduct,
      command?.externalApi,
      command?.languagePreference,
    );
    // send invoice

    const productInvoice = await Promise.all(
      productInfo?.map(pro => ({
        id: pro._id.toString(),
        price: pro?.price?.sellingPrice,
        name: pro?.name,
      })),
    );

    await this.paymentService.sendInvoice({
      customerName: order?.firstName,
      customerEmail: order?.email,
      invoiceType: 101,
      product: productInvoice,
      transactionId: parseInt(order._id?.toString(), 10),
      purpose: PaymentPurpose.ORDER,
      sumPaid: order?.totalAmount,
      languagePreference: command?.languagePreference,
      additionalInformation: 'Paid via Voucher',
    });

    return order;
  }

  // shaleev
  // async processCheckout(
  //   body: StartCheckoutDto,
  //   loggedInUser?: LoggedInUserInterface,
  // ): Promise<any> {
  //   try {
  //     const { cartId, ...command } = body;

  //     const externalApiId = (
  //       await this.externalApiService.findByIdentifierId(command.identifierId)
  //     )._id;

  //     if (!cartId) {
  //       throw new BadRequestException('Please enter valid cart details');
  //     }

  //     let businessId = [];

  //     const cartDetail = await this.cartService.findOneByIdAndPopulate(cartId);

  //     await Promise.all(
  //       command.products?.map(async (product: any) => {
  //         if (!product.id) {
  //           return;
  //         }

  //         const productDetail = await this.productsService.findOne(product.id);

  //         businessId = [...businessId, productDetail?.businessId?._id];
  //       }),
  //     );

  //     // freeze the voucher
  //     //  calling a api instead we need to freeze voucher here instead
  //     const newOrder = new this.OrderModel({
  //       ...command,
  //       businessId,
  //       userId: loggedInUser?.id,
  //       status: OrderStatus.PENDING,
  //       paymentStatus: PaymentStatus.PENDING,
  //       totalAmount: cartDetail.totalAmount,
  //       externalApiId,
  //       createdBy: loggedInUser?.id,
  //       createdAt: new Date(),
  //     });

  //     const order = await newOrder.save();

  //     await this.cartService.updateCartPostCheckout(
  //       cartId,
  //       order._id,
  //       loggedInUser,
  //     );

  //     this.logger.info(`[${externalApiId} - ORDERS]: Start to create order`, {
  //       message: order,
  //     });

  //     return order;
  //   } catch (error) {
  //     this.logger.error(
  //       `[${body.identifierId} - ORDERS]:  FAILED TO CREATE ORDER WHILE STARTING TO CHECKOUT`,
  //       {
  //         err: error.message,
  //       },
  //     );
  //     exceptionHandling(error);
  //   }
  // }

  async updateAfterPaymentSuccess(
    orderId: string,
    languagePreference?: Locale,
  ): Promise<{ updateOrder: Order; getProductInformation: Product[] }> {
    try {
      const updatedField = {
        paymentStatus: PaymentStatus.SUCCESS,
        status: OrderStatus.PROCESSING,
        paymentDate: new Date(),
      };

      const updateOrder = await updateById<Order>(
        this.OrderModel,
        orderId,
        updatedField,
      );

      this.logger.info('[ORDER]: UPDATED AFTER PAYMENT SUCCESS', {
        message: updateOrder,
      });

      const cart = await this.cartService.updateCartPostPayment(orderId);

      const findCartProducts = cart?.product;

      await this.productsService.deductQuantity(findCartProducts);

      const getProductInformation
        = await this.productsService.getProductInformationForOrders(
          updateOrder.products,
        );

      const orderProduct = await Promise.all(
        updateOrder.products.map(async product => {
          const cartItem = findCartProducts.find(
            item => item.id.toString() === product.id.toString(),
          );

          const productsInfo = getProductInformation.find(
            item => item._id.toString() === product.id.toString(),
          );

          return await this.orderProductService.create({
            productId: new mongoose.Types.ObjectId(cartItem.id),
            quantity: cartItem?.quantity,
            email: cartItem?.email,
            countryCode: cartItem?.countryCode,
            phone: cartItem?.phone,
            firstName: cartItem?.firstName,
            lastName: cartItem?.lastName,
            deliveryFee: cartItem?.deliveryFee,
            deliveryMethod: cartItem?.deliveryMethod,
            deliveryArea: cartItem?.deliveryArea,
            deliveryPickupLocation: cartItem?.deliveryPickupLocation,
            houseNo: cartItem?.houseNo,
            apartment: cartItem?.apartment,
            city: cartItem?.city,
            street: cartItem?.street,
            isGift: cartItem?.isGift,
            additionalInfo: cartItem?.additionalInfo,
            amount: productsInfo.price.sellingPrice,
            loggedInUserId: updateOrder.userId,
            orderId: updateOrder.id,
          });
        }),
      );

      const externalApi
        = await this.externalApiService.findByIdAndPopulateTheme(
          updateOrder?.externalApiId?.toString(),
        );

      await this.sendEmailPostOrderPayment(
        getProductInformation,
        updateOrder,
        orderProduct,
        externalApi,
        languagePreference,
      );

      return {
        updateOrder,
        getProductInformation,
      };
    } catch (err) {
      this.logger.error('[ORDER]: FAILED TO UPDATE AFTER PAYMENT SUCCESS', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async updateAfterPaymentFailure(orderId: string): Promise<Order> {
    try {
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

      this.logger.info('[ORDER]: UPDATED AFTER PAYMENT FAILED', {
        message: updateOrder,
      });

      return updateOrder;
    } catch (err) {
      this.logger.error('[ORDER]: FAILED TO UPDATE AFTER PAYMENT FAILURE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async update(
    id: string,
    body: UpdateOrderDto,
    loggedInUserId?: string,
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

      this.logger.info('[ORDER]: UPDATED', { message: updateOrder });

      return updateOrder;
    } catch (err) {
      this.logger.error('[ORDER]: FAILED TO UPDATE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async findOneById(id: string): Promise<Order> {
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
    orderId: string,
    body: UpdateOrderDto,
    loggedInUser?: LoggedInUserInterface,
  ): Promise<Order> {
    try {
      const order = await this.findOneById(orderId);

      if (!order) {
        throw new ForbiddenException(ServerErrors.FORBIDDEN);
      }

      // update vouchers
      // update products
      const updatedOrder = await this.update(orderId, body, loggedInUser?.id);

      this.logger.info('[ORDER]: UPDATED', { message: order });
      return updatedOrder;
    } catch (error) {
      this.logger.error('[ORDER]: FAILED TO UPDATE', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  // async updateOrderPostSuccessPayment(
  //   orderId: string,
  //   loggedInUser?: LoggedInUserInterface,
  // ): Promise<Order> {
  //   try {
  //     const updatedField = {
  //       paymentStatus: PaymentStatus.SUCCESS,
  //       status: OrderStatus.PROCESSING,
  //       updatedAt: new Date(),
  //       updatedBy: loggedInUser?.id,
  //     };

  //     const updateOrder = await updateById<Order>(
  //       this.OrderModel,
  //       orderId,
  //       updatedField,
  //     );

  //     this.logger.info('[ORDER]: UPDATED AFTER PAYMENT SUCCESS', {
  //       message: updateOrder,
  //     });

  //     await Promise.all(
  //       updateOrder.products.map(async product => {
  //         await this.orderProductService.create({
  //           productId: product.id,
  //           quantity: product.quantity,
  //           loggedInUserId: updateOrder.userId,
  //           orderId: updateOrder.id,
  //         });
  //       }),
  //     );

  //     return updateOrder;
  //   } catch (err) {
  //     this.logger.error('[ORDER]: FAILED TO UPDATE AFTER PAYMENT SUCCESS', {
  //       err: err.message,
  //     });
  //     exceptionHandling(err);
  //   }
  // }

  async updateOrderPostFailurePayment(
    orderId: string,
    loggedInUser: LoggedInUserInterface,
  ): Promise<Order> {
    try {
      const updatedField = {
        paymentStatus: PaymentStatus.FAILURE,
        status: OrderStatus.CANCELED,
        updatedAt: new Date(),
        updatedBy: loggedInUser?.id,
      };

      const updateOrder = await updateById<Order>(
        this.OrderModel,
        orderId,
        updatedField,
      );

      this.logger.info('[ORDER]: UPDATED AFTER PAYMENT FAILED', {
        message: updateOrder,
      });

      return updateOrder;
    } catch (err) {
      this.logger.error('[ORDER]: FAILED TO UPDATE AFTER PAYMENT FAILURE', {
        err: err.message,
      });
      exceptionHandling(err);
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
      const dmoId = new mongoose.Types.ObjectId(queries.loggedInUser.dmo.id);

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
      sort: 'createdAt',
      sortOrder: SortOrder.DESC,
    });
    return orders;
  }

  private async checkIfAllowed(
    loggedInUser: any,
    orderId: string,
  ): Promise<Order> {
    const allowedRoles = [UserType.ADMIN, UserType.DMO, UserType.SUPERADMIN];
    const order = await this.findOneById(orderId);

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
    try {
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

      this.logger.info('[EXTERNAL_API_ORDER]: PROCESSED VOUCHER FOR ORDER', {
        message: voucherInfo,
      });

      return voucherInfo;
    } catch (err) {
      this.logger.error(
        '[EXTERNAL_API_ORDER]: FAILED TO PROCESS VOUCHER FOR ORDER',
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async findOneByIdAndPopulate(id: string) {
    try {
      const populate = {
        path: 'externalApiId',
        select: '_id, identifierId',
      };
      const order = await this.OrderModel.findById(id).populate(populate);

      if (!order) {
        throw new NotFoundException(ServerErrors.ORDERS.NOT_FOUND);
      }

      return order;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async updatePostPaymentStart(
    id: string,
    body: any,
    loggedInUserId?: string,
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

      this.logger.info('[ORDER]: UPDATED', { message: updateOrder });

      return updateOrder;
    } catch (err) {
      this.logger.error('[ORDER]: FAILED TO UPDATE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async sendEmailPostOrderPayment(
    productInfo: Product[],
    order: Order,
    orderProduct: OrderProduct[],
    externalApi: any,
    languagePreference?: Locale,
  ) {
    console.log(languagePreference);

    const businessIds = productInfo.map(pro => pro.businessId);

    const businessDetails = await this.businessService.findBusinessEmailByIds(
      businessIds,
    );

    const { bucketUrl, emailFields } = getCommonEmailFields(
      externalApi.identifierId,
      externalApi.themeId,
    );

    const orderEmailFields = {
      ...emailFields,
      BUTTON_LINK: externalApi?.themeId?.websiteUrl,
      BANNER_IMG: `${bucketUrl}footer/banner-web.png`,
      MOBILE_BANNER_IMG: `${bucketUrl}footer/banner-mobile.png`,
      FOOTER_LINK1: externalApi?.themeId?.websiteUrl,
      BUSINESSNAME: businessDetails[0]?.name || '',
      BUSINESSPHONE:
        `${businessDetails[0]?.countryCode}-${businessDetails[0]?.phoneNumber}`
        || '',
      BUSINESSEMAIL: businessDetails[0]?.busiEmail || '',
    };

    type EmailOrderGroup = {
      buyerName: string;
      products: {
        quantity: number;
        image?: any;
        name: string;
        price: number;
        deliveryFee: number;
      }[];
      totalAmount: number;
    };

    const emailToProductsMap: { [email: string]: EmailOrderGroup } = {};

    orderProduct.forEach(orderItem => {
      const { email } = orderItem;
      const product = productInfo.find(
        p => p._id.toString() === orderItem.productId.toString(),
      );

      if (!product) return;

      if (!emailToProductsMap[email]) {
        emailToProductsMap[email] = {
          buyerName: orderItem.firstName,
          products: [],
          totalAmount: 0,
        };
      }

      const price = orderItem?.amount || product?.price?.sellingPrice;
      const quantity = orderItem?.quantity || 1;
      const deliveryFee = orderItem?.deliveryFee || 0;

      emailToProductsMap[email].products.push({
        quantity,
        image: product?.images[0]?.image,
        name: product?.name,
        price,
        deliveryFee,
      });

      emailToProductsMap[email].totalAmount += price * quantity + deliveryFee;
    });

    await Promise.all(
      Object.entries(emailToProductsMap).map(async ([email, group]) => {
        const productsHtml = group.products
          .map(
            product => `
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; background: #f3f8f5; direction: rtl; border-radius: 20px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 0; vertical-align: middle;">
                        <img src="${product?.image || ''}" alt="${
  product?.name
}"
                          style="max-width: 100px; height: 100px; margin-left: 10px; display: block;">
                      </td>
                      <td style="padding: 0 10px; vertical-align: middle;" width="100%">
                        <span style="display: block; font-size: 16px; color: #333333;">${
  product?.name
}</span>
                        <span style="display: block; font-size: 14px; color: #666666;">כמות: ${
  product?.quantity
}</span>
<span style="display: block; font-size: 14px; color: #666666;">
דמי משלוח: ₪${product?.deliveryFee}</span>
                      </td>
                      <td style="padding: 0; vertical-align: middle; white-space: nowrap;">
                        <span dir="rtl" style="font-size: 16px; color: #333333;">₪${
  product?.price
}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            `,
          )
          .join('');

        await this.mailchimpService.sendTransactionalEmail({
          to: email,
          templatedId: DynamicEmailTemplate.OrderConfirmationForClient,
          mergeVars: {
            ...orderEmailFields,
            PRODUCTS_HTML: productsHtml,
            BUYERNAME: group.buyerName,
            TOTALAMOUNT: group.totalAmount,
            CHANGE_SETTINGS_LINK: externalApi?.themeId?.websiteUrl,
            BUSINESSADDRESS: businessDetails[0]?.address?.location || '',
            QRCODEURL: order?.qrCodeUrl || '',
          },
        });
      }),
    );

    // SEND TO BUSINESS OWNER
    await Promise.all(
      businessDetails.map(async business => {
        const relevantProducts = productInfo.filter(
          product => product.businessId.toString() === business._id.toString(),
        );

        let businessTotalAmount = 0;

        const productsHtmlForEchBusiness = relevantProducts
          .map(product => {
            const matchingProduct = orderProduct.find(
              p => p.productId.toString() === product._id.toString(),
            );

            if (!matchingProduct) return '';

            const quantity = matchingProduct.quantity || 1;
            const price
              = matchingProduct.amount || product.price?.sellingPrice || 0;
            const deliveryFee = matchingProduct.deliveryFee || 0;

            const totalPriceForThisProduct = quantity * price + deliveryFee;

            businessTotalAmount += totalPriceForThisProduct;

            return `
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; background: #f3f8f5; direction: rtl; border-radius: 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 0; vertical-align: middle;">
                      <img src="${product.images?.[0]?.image || ''}" alt="${
  product?.name
}"
                        style="max-width: 100px; height: 100px; margin-left: 10px; display: block;">
                    </td>
                    <td style="padding: 0 10px; vertical-align: middle;" width="100%">
                      <span
                        style="display: block; font-size: 16px; color: #333333;">${
  product?.name
}</span>
                      <span style="display: block; font-size: 14px; color: #666666;">כמות:
                          ${quantity}</span>
                      <span style="display: block; font-size: 14px; color: #666666;">
דמי משלוח: ₪${deliveryFee}</span>
                    </td>
                    <td style="padding: 0; vertical-align: middle; white-space: nowrap;">
                      <span dir="rtl" style="font-size: 16px; color: #333333;">₪${price}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
            `;
          })
          .join('');

        await this.mailchimpService.sendTransactionalEmail({
          to: business?.busiEmail,
          templatedId: DynamicEmailTemplate.OrderConfirmationForVendor,
          mergeVars: {
            ...orderEmailFields,
            TOTALAMOUNT: businessTotalAmount,
            BUYERNAME: order?.firstName,
            PRODUCTS_HTML: productsHtmlForEchBusiness,
            PLATFORM_NAME: externalApi?.name,
            BUYER_PHONE_NUMBER: order.phone,
            BUYER_ORDER_EMAIL: order.email,
          },
        });
      }),
    );
  }
}
