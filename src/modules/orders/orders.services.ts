import { GaMeasurementService } from 'src/modules/ga-measurement/ga-measurement.service';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Logger } from 'winston';
import { QueryBus } from '@nestjs/cqrs';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { ServerErrors } from 'src/common/constant';
import { Currency, Locale, PaymentStatus } from 'src/common/enum';
import { DynamicEmailTemplate } from 'src/common/mailchimp/templateId';
import { sortByPriorityAndHighest } from 'src/common/sort-priority-and-highest';
import { getCommonEmailFields } from 'src/common/utils/email/common-fields';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { findOneById, updateById } from 'src/core/helper/query-helper';
import { calculateProductsTotalAmount } from 'src/common/calculate-products-total-amount';

import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { BusinessService } from 'src/modules/business/shared/services/business.service';
import { CartService } from 'src/modules/cart/cart.service';
import { Cart } from 'src/modules/cart/cart.schema';
import { CartProductResponse, CartStatus } from 'src/modules/cart/cart.types';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { EventTicketAnswer } from 'src/modules/event-ticket-answers/schema/event-ticket-answer.schema';
import { ProductsService } from 'src/modules/products/products.services';
import { UserType } from 'src/modules/users/users.type';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { CreateOrderDto } from 'src/modules/orders/dto';
import {
  DeliveryMethod,
  OrderItemType,
  OrderStatus,
  PaymentMode,
} from 'src/modules/orders/orders.type';
import { OrderProductService } from 'src/modules/order-product/order-product.services';
import { notifyHighValueOrder } from 'src/modules/orders/high-value-order-alert';

import { PaymentsService } from 'src/services/payments/payments.service';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { SmsService } from 'src/services/sms/sms.service';
import { CreateOrderCommand } from 'src/modules/orders/interface/create-order.interface';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { QRCodeService } from 'src/services/qr-code/qr-code.service';
import { QrTokenService } from 'src/services/qr-token/qr-token.service';
import { ConfigService } from 'src/services/config/config.service';
import { OrderProduct } from 'src/modules/order-product/schema/order-product.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { SessionBookingsService } from 'src/modules/session-bookings/session-bookings.service';
import { GetTicketByIdsQuery } from '../tickets/queries/get-ticket-by-ids.query';
import { Ticket } from '../tickets/schema/tickets.schema';
import { TicketsService } from '../tickets/tickets.services';
import { GetEventByIdsQuery } from '../events/queries/get-by-ids.query';
import { DocUploadService } from '../doc-upload/doc-upload.service';

function hexToRgba(hex: string, opacity: number): string {
  if (!hex) return `rgba(0, 0, 0, ${opacity})`;
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function isEventExpired(dayDescription: { date: Date }[]): boolean {
  if (!dayDescription || dayDescription.length === 0) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastEventDate = dayDescription[dayDescription.length - 1].date;
  const eventDateOnly = new Date(lastEventDate);
  eventDateOnly.setHours(0, 0, 0, 0);

  return eventDateOnly < today;
}

@Injectable()
export class OrdersService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly gaMeasurement: GaMeasurementService,
    private readonly queryBus: QueryBus,
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
    @InjectModel(OrderProduct.name)
    private OrderProductModel: Model<OrderProduct>,
    @InjectModel(EventTicketAnswer.name)
    private readonly eventTicketAnswerModel: Model<EventTicketAnswer>,
    private readonly businessService: BusinessService,
    private readonly mailchimpService: MailChimpService,
    private readonly productsService: ProductsService,
    private readonly ticketsService: TicketsService,
    private readonly orderProductService: OrderProductService,
    @Inject(forwardRef(() => VoucherService))
    private readonly voucherService: VoucherService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
    private readonly externalApiService: ExternalApiServices,
    private readonly cartService: CartService,
    private readonly qrCodeService: QRCodeService,
    private readonly qrTokenService: QrTokenService,
    private readonly configService: ConfigService,
    private readonly campaignService: CampaignService,
    private readonly docUploadService: DocUploadService,
    private readonly sessionBookingsService: SessionBookingsService,
    private readonly smsService: SmsService,
  ) { }

  async getVendorOwnerForOrder(
    orderId: string,
    vendorId?: string,
  ): Promise<{
    userId: string;
    email?: string;
  } | null> {
    const order = await findOneById(this.OrderModel, orderId);

    if (!order?.products || order.products.length === 0) return null;

    let businessId: string;

    if (vendorId) {
      // If vendorId provided, use it directly as businessId
      businessId = vendorId;
    } else {
      // Default: get businessId from first product
      const firstProduct = await this.productsService.findOne(
        order.products[0].id.toString(),
        Locale.ENGLISH,
      );
      if (!firstProduct?.businessId) return null;
      businessId = firstProduct.businessId.toString();
    }

    const businessDetails = await this.businessService.findBusinessEmailByIds([
      businessId as any,
    ]);

    const business = businessDetails?.[0] as any;
    const ownerId = business?.userId?._id || business?.userId;

    if (!ownerId) return null;

    return {
      userId: ownerId.toString(),
      email:
        business?.userId?.email
        || business?.busiEmail
        || business?.contactDetails?.email,
    };
  }

  private extractBuyerAddress(
    orderProducts: OrderProduct[],
    fallbackAddress: string = '',
  ): string {
    if (!orderProducts || orderProducts.length === 0) {
      return fallbackAddress;
    }

    const firstProduct = orderProducts[0];

    // Priority 1: Check for home delivery address (city, street, houseNo, apartment)
    const homeDeliveryAddress = [
      firstProduct?.houseNo,
      firstProduct?.apartment,
      firstProduct?.street,
      firstProduct?.city,
    ]
      .filter(Boolean)
      .join(', ');

    if (homeDeliveryAddress) {
      return homeDeliveryAddress;
    }

    // Priority 2: Check for deliveryPickupLocation
    if (firstProduct?.deliveryPickupLocation) {
      return firstProduct.deliveryPickupLocation;
    }

    // Priority 3: Fall back to the provided address
    return fallbackAddress;
  }

  async startCheckOutProcess(
    body: CreateOrderDto,
    loggedInUser?: LoggedInUserInterface,
  ): Promise<any> {
    try {
      const cartDetails = await this.cartService.findOneById(body.cartId);

      if (
        cartDetails?.status === CartStatus.TIME_OUT
        || cartDetails?.status === CartStatus.ORDER_PLACED
      ) {
        throw new BadRequestException(
          'This cart is no longer available to checkout',
        );
      }

      if (
        cartDetails?.vendorProducts?.length
        && (!cartDetails?.product || cartDetails?.product?.length === 0)
      ) {
        this.logger.info('[ORDER]: Using vendor cart checkout', {
          cartId: body.cartId,
          vendorCount: cartDetails.vendorProducts.length,
        });
        return await this.startVendorCartCheckout(
          body,
          loggedInUser,
          cartDetails,
        );
      }

      // Log warning if both vendorProducts and product arrays exist (data inconsistency)
      if (cartDetails?.vendorProducts?.length && cartDetails?.product?.length) {
        this.logger.warn(
          '[ORDER]: DATA INCONSISTENCY - Both vendorProducts and product arrays exist during checkout',
          {
            cartId: body.cartId,
            vendorProductsCount: cartDetails.vendorProducts.length,
            productCount: cartDetails.product.length,
          },
        );
        // Fall through to regular checkout to prevent issues
      }

      if (!body.email) {
        throw new BadRequestException('Email is required');
      }

      if (!body.phone) {
        throw new BadRequestException('Phone is required');
      }

      const cartProducts = cartDetails.product
        .filter(product => product.itemType === OrderItemType.PRODUCT)
        .map(product => product.id.toString());

      const cartTickets = cartDetails.product
        .filter(ticket => ticket.itemType === OrderItemType.TICKET)
        .map(ticket => ticket.id.toString());

      const [productsFromDB, ticketsFromDB] = await Promise.all([
        cartProducts?.length
          ? this.productsService.findManyById(cartProducts)
          : [],
        cartTickets?.length
          ? this.queryBus.execute(new GetTicketByIdsQuery(cartTickets))
          : [],
      ]);

      // Check if any events are expired
      if (ticketsFromDB?.length) {
        const eventIds = ticketsFromDB
          .map((ticket: any) => ticket.eventId?.toString())
          .filter(Boolean);
        if (eventIds?.length) {
          const events = await this.queryBus.execute(
            new GetEventByIdsQuery(eventIds),
          );
          const expiredEvents = events?.filter((event: any) => isEventExpired(event.dayDescription));

          if (expiredEvents?.length) {
            const expiredEventNames = expiredEvents
              .map((e: any) => e.name)
              .join(', ');
            throw new BadRequestException(
              `The following events have already ended and tickets cannot be purchased: ${expiredEventNames}`,
            );
          }
        }
      }

      const combinedItems = [...productsFromDB, ...ticketsFromDB];

      const { payableAmount, cartItems, totalDeliveryFee }
        = await calculateProductsTotalAmount(cartDetails?.product, combinedItems);

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
              totalAmountToPay
                = Math.round((totalAmountToPay - redeemedAmount) * 100) / 100;
            }
          }
        }
      }

      const products = cartDetails.product.map(pro => ({
        id: pro.id.toString(),
      }));

      const cartItemsProduct = cartItems.filter(
        product => product.itemType === OrderItemType.PRODUCT,
      );

      const cartItemsTicket = cartItems.filter(
        ticket => ticket.itemType === OrderItemType.TICKET,
      );

      const order = await this.createOrder({
        loggedInUser,
        body,
        redeemedVouchers,
        totalAmount: totalAmountToPay,
        payableAmount,
        products,
        productDetails: productsFromDB,
        ticketDetails: ticketsFromDB,
        cartItemsProduct,
        cartItemsTicket,
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

  private async startVendorCartCheckout(
    body: CreateOrderDto,
    loggedInUser: LoggedInUserInterface | undefined,
    cartDetails: Cart,
  ): Promise<any> {
    const { vendorProducts } = cartDetails;

    const payableAmount
      = Math.round(
        vendorProducts.reduce(
          (sum, vendor) => sum + vendor.totalAmount + (vendor.deliveryFee || 0),
          0,
        ) * 100,
      ) / 100;

    const totalDeliveryFee
      = Math.round(
        vendorProducts.reduce(
          (sum, vendor) => sum + (vendor.deliveryFee || 0),
          0,
        ) * 100,
      ) / 100;

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
              (total: number, item: { redeemedAmount: number }) => total + item.redeemedAmount,
              0,
            );
            totalAmountToPay
              = Math.round((totalAmountToPay - redeemedAmount) * 100) / 100;
          }
        }
      }
    }

    const allProducts = vendorProducts.flatMap(vendor => vendor.products.map(p => ({ id: p._id.toString() })));

    return await this.createOrder({
      loggedInUser,
      body,
      redeemedVouchers,
      totalAmount: totalAmountToPay,
      payableAmount,
      products: allProducts,
      productDetails: [],
      ticketDetails: [],
      cartItemsProduct: [],
      cartItemsTicket: [],
      totalDeliveryFee,
    });
  }

  async createOrder(orderCommand: CreateOrderCommand): Promise<any> {
    const {
      loggedInUser,
      body,
      redeemedVouchers,
      totalAmount,
      payableAmount,
      totalDeliveryFee,
      products,
      productDetails,
      ticketDetails,
      cartItemsProduct,
      cartItemsTicket,
    } = orderCommand;

    try {
      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        body.campCode,
      );

      // Validate identifierId before creating order
      let externalApi;
      try {
        externalApi = await this.externalApiService.findByIdentifierId(
          body.identifierId,
        );
      } catch (error) {
        this.logger.error('[EXTERNAL_API_ORDERS]: INVALID IDENTIFIER ID', {
          identifierId: body.identifierId,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      const newOrder = new this.OrderModel();

      const baseUrl
        = this.configService.get('ENV_NAME') === 'prod'
          ? 'https://workspace.metgo.app/'
          : 'https://stg.workspace.metgo.app/';

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
        // For event ticket purchases, set vendorId to eventId
        vendorId: ticketDetails?.[0]?.eventId ?? null,
      };

      // Backfill orderId onto any matching answer doc submitted earlier in
      // this checkout (see EventTicketAnswer#orderId). Best-effort only -
      // never let it block order creation.
      try {
        const ticketObjectIds = (products || [])
          .map(product => (mongoose.Types.ObjectId.isValid(product.id) ? new mongoose.Types.ObjectId(product.id) : null))
          .filter((id): id is mongoose.Types.ObjectId => id !== null);

        if (ticketObjectIds.length && body.email) {
          await this.eventTicketAnswerModel.updateMany(
            {
              'eventInfo.ticketIds': { $in: ticketObjectIds },
              'purchaserInfo.email': body.email,
              ...(body.phone ? { 'purchaserInfo.phone': body.phone } : {}),
              orderId: { $exists: false },
            },
            { $set: { orderId: newOrder._id } },
          );
        }
      } catch (error) {
        this.logger.error('[EXTERNAL_API_ORDERS]: FAILED TO LINK TICKET ANSWERS TO ORDER', {
          orderId: newOrder._id.toString(),
          err: error instanceof Error ? error.message : String(error),
        });
      }

      if (totalAmount <= 0) {
        return await this.createOrderWithOnlyVouchers(
          command,
          productDetails,
          ticketDetails,
          cartItemsProduct,
          cartItemsTicket,
          loggedInUser,
          body,
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
    totalAmount: number,
    payableAmount: number,
    loggedInUser?: LoggedInUserInterface,
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

  async createOrderWithOnlyVouchers(
    command,
    productInfo: Product[],
    ticketInfo: Ticket[],
    cartItemsProduct: CartProductResponse[] = [],
    cartItemsTicket: CartProductResponse[] = [],
    loggedInUser: LoggedInUserInterface | null,
    body?: any,
  ) {
    // Fetch cart to check if it has vendor products
    let cart;
    if (body?.cartId) {
      cart = await this.cartService.findOneById(body.cartId);
    }

    // If cart has vendor products, use vendor split order creation
    // Only proceed if vendorProducts has data and regular product array is empty
    if (
      cart?.vendorProducts?.length
      && (!cart?.product || cart?.product?.length === 0)
    ) {
      this.logger.info('[ORDER]: Using vendor split for voucher payment', {
        cartId: body?.cartId,
        vendorCount: cart.vendorProducts.length,
      });
      const parentOrder = new this.OrderModel({
        ...command,
        externalApiId: command?.externalApi?._id,
        paymentDate: new Date(),
        paymentStatus: PaymentStatus.SUCCESS,
        status: OrderStatus.PROCESSING,
        paymentMode: [PaymentMode.VOUCHER],
      });
      const savedParentOrder = await parentOrder.save();
      await notifyHighValueOrder(savedParentOrder, {
        mailchimpService: this.mailchimpService,
        configService: this.configService,
        externalApiService: this.externalApiService,
        logger: this.logger,
      });
      const splitResult = await this.createVendorSplitOrdersForVoucher(
        savedParentOrder,
        cart,
        command?.externalApi,
      );
      // paid entirely by voucher - no Cardcom webhook, so report the
      // purchase to GA4 here (fire and forget)
      this.gaMeasurement
        .sendPurchase(savedParentOrder._id, body?.cartId)
        .catch(() => undefined);
      return splitResult;
    }

    // Log warning if both vendorProducts and product arrays exist (data inconsistency)
    if (cart?.vendorProducts?.length && cart?.product?.length) {
      this.logger.warn(
        '[ORDER]: DATA INCONSISTENCY - Both vendorProducts and product arrays exist in voucher order',
        {
          cartId: body?.cartId,
          vendorProductsCount: cart.vendorProducts.length,
          productCount: cart.product.length,
        },
      );
      // Fall through to regular order processing
    }

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

    await notifyHighValueOrder(order, {
      mailchimpService: this.mailchimpService,
      configService: this.configService,
      externalApiService: this.externalApiService,
      logger: this.logger,
    });

    // create order products
    const cartItems = [...cartItemsProduct, ...cartItemsTicket];

    const orderProduct = await Promise.all(
      order.products
        .map(product => {
          const cartItem = cartItems.find(
            item => item.id.toString() === product.id.toString(),
          );
          return { product, cartItem };
        })
        .filter(({ cartItem }) => cartItem)
        .map(({ cartItem }) => {
          const isTicket = cartItem.itemType === OrderItemType.TICKET;
          return this.orderProductService.create({
            itemId: cartItem.id,
            quantity: cartItem.quantity,
            email: cartItem.email,
            countryCode: cartItem.countryCode,
            phone: cartItem.phone,
            firstName: cartItem.firstName,
            lastName: cartItem.lastName,
            deliveryFee: cartItem.deliveryFee,
            deliveryMethod: cartItem.deliveryMethod,
            deliveryArea: cartItem.deliveryArea,
            deliveryPickupLocation: cartItem.deliveryPickupLocation,
            houseNo: cartItem.houseNo,
            apartment: cartItem.apartment,
            city: cartItem.city,
            street: cartItem.street,
            isGift: cartItem.isGift,
            additionalInfo: cartItem.additionalInfo,
            amount: cartItem.amount,
            orderId: order.id,
            loggedInUserId: loggedInUser?.id,
            itemType: cartItem.itemType,
            // tickets have no shipping step - fulfilled instantly on
            // purchase, so skip PROCESSING (products keep the default)
            ...(isTicket && {
              status: OrderStatus.COMPLETED,
              completed: { date: new Date(), isAutomatic: true },
            }),
          });
        }),
    );

    if (cartItemsProduct?.length) {
      await this.productsService.deductQuantity(cartItemsProduct);
    }

    if (cartItemsTicket?.length) {
      await this.ticketsService.deductQuantity(cartItemsTicket);
    }

    // Ticket-only voucher order is done instantly - nothing else rolls
    // Order.status up from its order-products, so set it here.
    if (cartItemsTicket?.length && !cartItemsProduct?.length) {
      await updateById<Order>(this.OrderModel, order._id, {
        status: OrderStatus.COMPLETED,
      });
      order.status = OrderStatus.COMPLETED;
    }

    await this.cartService.updateCartPostCheckout(
      command.cartId,
      order._id,
      loggedInUser,
    );

    if (cartItemsProduct?.length) {
      await this.sendEmailPostOrderPayment(
        productInfo,
        order,
        orderProduct,
        command?.externalApi,
      );
    }

    if (cartItemsTicket?.length) {
      await this.sendEmailPostTicketPayment(
        ticketInfo,
        order,
        orderProduct,
        command?.externalApi,
        command?.languagePreference,
      );
    }

    // need to send emails for products

    const productInvoice = await Promise.all(
      productInfo?.map(pro => ({
        id: pro._id.toString(),
        price: pro?.price?.sellingPrice,
        name: pro?.nameHe || pro?.name || pro?.nameAr,
      })),
    );
    const ticketInvoice = await Promise.all(
      ticketInfo?.map(ticket => ({
        id: ticket._id.toString(),
        price: ticket?.price?.sellingPrice,
        name: ticket?.name,
      })),
    );

    try {
      await this.paymentService.sendInvoice({
        customerName: order?.firstName,
        customerEmail: order?.email,
        invoiceType: 101,
        product: [...productInvoice, ...ticketInvoice],
        transactionId: parseInt(order._id?.toString(), 10),
        purpose: PaymentPurpose.ORDER,
        sumPaid: order?.totalAmount,
        languagePreference: command?.languagePreference,
        additionalInformation: 'Paid via Voucher',
      });
    } catch (invoiceError) {
      this.logger.warn(
        '[ORDER]: Failed to send invoice after voucher payment',
        {
          orderId: order._id,
          error:
            invoiceError instanceof Error
              ? invoiceError.message
              : String(invoiceError),
        },
      );
    }

    // paid entirely by voucher - no Cardcom webhook, so report the purchase
    // to GA4 here (fire and forget)
    this.gaMeasurement.sendPurchase(order._id, body?.cartId).catch(() => undefined);

    return order;
  }

  async updateAfterPaymentSuccess(
    orderId: string,
    languagePreference?: Locale,
  ): Promise<{ updateOrder: Order; getProductInformation: Product[] }> {
    try {
      // Check if order exists before attempting to update
      const existingOrder = await findOneById<Order>(this.OrderModel, orderId);
      if (!existingOrder) {
        this.logger.error('[ORDER]: ORDER NOT FOUND FOR PAYMENT SUCCESS', {
          orderId,
          error: 'Order does not exist in database',
        });
        throw new Error(
          'Order not found. Cannot process payment success for non-existent order.',
        );
      }

      // Check if order is already processed to prevent duplicates
      if (existingOrder?.paymentStatus === PaymentStatus.SUCCESS) {
        this.logger.info(
          '[ORDER]: Order already processed, skipping duplicate',
          {
            orderId,
            paymentStatus: existingOrder.paymentStatus,
          },
        );
        // Return existing order data to avoid breaking the flow
        const productInfo
          = await this.productsService.getProductInformationForOrders(
            existingOrder.products.map(p => ({
              id: p.id,
              quantity: 1,
              itemType: OrderItemType.PRODUCT,
            })),
          );
        return {
          updateOrder: existingOrder,
          getProductInformation: productInfo,
        };
      }

      // A late success webhook can arrive after this order was already
      // marked CANCELED (customer closed the payment modal while Cardcom
      // was still processing, or the 15-min expiry cron fired just before
      // a delayed webhook landed). The payment genuinely succeeded, so
      // soft-delete the stray CANCELED OrderProduct rows that premature
      // cancellation created - otherwise the success flow below creates a
      // second, real set and the order ends up with duplicates.
      if (existingOrder.status === OrderStatus.CANCELED) {
        const staleOrderProducts = await this.OrderProductModel.updateMany(
          {
            orderId: existingOrder._id,
            status: OrderStatus.CANCELED,
            isDeleted: { $ne: true },
          },
          { isDeleted: true, deletedAt: new Date() },
        );
        this.logger.warn(
          '[ORDER]: LATE PAYMENT SUCCESS OVERRODE A PREMATURE CANCELLATION',
          {
            orderId,
            removedStaleOrderProducts: staleOrderProducts.modifiedCount,
          },
        );
      }

      const updatedField = {
        paymentStatus: PaymentStatus.SUCCESS,
        status: OrderStatus.PROCESSING,
        paymentDate: new Date(),
      };

      let updateOrder = await updateById<Order>(
        this.OrderModel,
        orderId,
        updatedField,
      );

      this.logger.info('[ORDER]: UPDATED AFTER PAYMENT SUCCESS', {
        message: updateOrder,
      });

      // Generate QR code and token for vendor email
      try {
        await this.generateQRCodeAndToken(orderId);
        // Fetch updated order with qrCodeUrl
        updateOrder = await findOneById<Order>(this.OrderModel, orderId);
      } catch (qrError) {
        this.logger.warn('[ORDER]: QR CODE GENERATION FAILED', {
          orderId,
          error: qrError instanceof Error ? qrError.message : String(qrError),
        });
      }

      // Alert for high-value orders (card / card + voucher, incl.
      // the parent of a vendor split). Runs once per order - the SUCCESS
      // guard above stops duplicate webhooks from re-triggering it.
      await notifyHighValueOrder(updateOrder, {
        mailchimpService: this.mailchimpService,
        configService: this.configService,
        externalApiService: this.externalApiService,
        logger: this.logger,
      });

      const externalApi
        = await this.externalApiService.findByIdAndPopulateTheme(
          updateOrder?.externalApiId?.toString(),
        );

      const cart = await this.cartService.updateCartPostPayment(orderId);

      // Split into per-vendor orders when cart was created vendor-wise
      // Only proceed with vendor split if vendorProducts has actual data and regular product array is empty
      if (
        cart?.vendorProducts?.length
        && (!cart?.product || cart?.product?.length === 0)
      ) {
        this.logger.info(
          '[ORDER]: Proceeding with vendor split order creation',
          {
            orderId,
            vendorCount: cart.vendorProducts.length,
          },
        );
        return await this.createVendorSplitOrders(
          updateOrder,
          cart,
          externalApi,
        );
      }

      // Log warning if both vendorProducts and product arrays exist (data inconsistency)
      if (cart?.vendorProducts?.length && cart?.product?.length) {
        this.logger.warn(
          '[ORDER]: DATA INCONSISTENCY - Both vendorProducts and product arrays exist',
          {
            orderId,
            vendorProductsCount: cart.vendorProducts.length,
            productCount: cart.product.length,
          },
        );
        // Fall through to regular order processing to prevent order deletion
      }

      const findCartProducts = cart?.product?.filter(
        item => item.itemType === OrderItemType.PRODUCT,
      );

      const findCartTickets = cart?.product?.filter(
        item => item.itemType === OrderItemType.TICKET,
      );

      let getProductsInformation = [];
      let getTicketsInformation = [];

      if (findCartProducts?.length) {
        await this.productsService.deductQuantity(findCartProducts);
        getProductsInformation
          = await this.productsService.getProductInformationForOrders(
            findCartProducts,
          );

        // Validate all products have matching cart items
        const missingProductItems = updateOrder.products.filter(
          product => !findCartProducts.find(
            item => item.id.toString() === product.id.toString(),
          ),
        );

        if (missingProductItems.length > 0) {
          this.logger.warn(
            '[ORDER]: Missing cart items for some products after payment',
            {
              orderId: updateOrder._id,
              missingProductIds: missingProductItems.map(p => p.id),
            },
          );
        }

        const orderProduct = await Promise.all(
          updateOrder.products
            .map(product => {
              const cartItem = findCartProducts.find(
                item => item.id.toString() === product.id.toString(),
              );

              const productsInfo = getProductsInformation.find(
                item => item._id.toString() === product.id.toString(),
              );

              return { product, cartItem, productsInfo };
            })
            // A paid order must always get its orderProduct - missing
            // productsInfo (deleted/deactivated product) is a pricing gap.
            .filter(({ cartItem }) => cartItem)
            .map(
              async ({ cartItem, productsInfo }) => {
                if (!productsInfo) {
                  this.logger.warn(
                    '[ORDER]: PRODUCT INFO NOT FOUND FOR PAID ORDER ITEM - CREATING ORDER PRODUCT WITH FALLBACK AMOUNT',
                    { orderId: updateOrder._id, productId: cartItem.id },
                  );
                }
                return this.orderProductService.create({
                  itemId: new mongoose.Types.ObjectId(cartItem.id),
                  quantity: cartItem.quantity,
                  email: cartItem.email,
                  countryCode: cartItem.countryCode,
                  phone: cartItem.phone,
                  firstName: cartItem.firstName,
                  lastName: cartItem.lastName,
                  deliveryFee: cartItem.deliveryFee,
                  deliveryMethod: cartItem.deliveryMethod,
                  deliveryArea: cartItem.deliveryArea,
                  deliveryPickupLocation: cartItem.deliveryPickupLocation,
                  houseNo: cartItem.houseNo,
                  apartment: cartItem.apartment,
                  city: cartItem.city,
                  street: cartItem.street,
                  isGift: cartItem.isGift,
                  additionalInfo: cartItem.additionalInfo,
                  amount: productsInfo?.price?.sellingPrice || 0,
                  loggedInUserId: updateOrder.userId,
                  orderId: updateOrder.id,
                  itemType: cartItem.itemType,
                });
              },
            ),
        );

        await this.sendEmailPostOrderPayment(
          getProductsInformation,
          updateOrder,
          orderProduct,
          externalApi,
        );
      }

      if (findCartTickets?.length) {
        const cartTickets = findCartTickets
          .filter(ticket => ticket.itemType === OrderItemType.TICKET)
          .map(ticket => ticket.id.toString());

        await this.ticketsService.deductQuantity(findCartTickets);
        getTicketsInformation = await this.queryBus.execute(
          new GetTicketByIdsQuery(cartTickets),
        );

        // Validate all tickets have matching cart items
        const missingTicketItems = updateOrder.products.filter(
          product => !findCartTickets.find(
            item => item.id.toString() === product.id.toString(),
          ),
        );

        if (missingTicketItems.length > 0) {
          this.logger.warn(
            '[ORDER]: Missing cart items for some tickets after payment',
            {
              orderId: updateOrder._id,
              missingTicketIds: missingTicketItems.map(p => p.id),
            },
          );
        }

        const orderProductArrays = await Promise.all(
          updateOrder.products
            .map(product => {
              const cartItem = findCartTickets.find(
                item => item.id.toString() === product.id.toString(),
              );

              const ticketInfo = getTicketsInformation.find(
                item => item._id.toString() === product.id.toString(),
              );

              return { product, cartItem, ticketInfo };
            })
            // A paid order must always get its orderProduct - missing
            // ticketInfo (deleted/deactivated ticket) is a pricing gap.
            .filter(({ cartItem }) => cartItem)
            .map(async ({ cartItem, ticketInfo }) => {
              if (!ticketInfo) {
                this.logger.warn(
                  '[ORDER]: TICKET INFO NOT FOUND FOR PAID ORDER ITEM - CREATING ORDER PRODUCT WITH FALLBACK AMOUNT',
                  { orderId: updateOrder._id, ticketId: cartItem.id },
                );
              }
              // For EVENT TICKETS ONLY: create one orderProduct per ticket (quantity: 1 each)
              // This ensures each ticket has its own QR code and tracking
              // Note: This logic is ONLY for tickets (itemType === TICKET), not for products
              if (cartItem.itemType !== OrderItemType.TICKET) {
                // Fallback to single record for non-tickets (safety check)
                return [
                  await this.orderProductService.create({
                    itemId: new mongoose.Types.ObjectId(cartItem.id),
                    quantity: cartItem.quantity,
                    email: cartItem.email,
                    countryCode: cartItem.countryCode,
                    phone: cartItem.phone,
                    firstName: cartItem.firstName,
                    lastName: cartItem.lastName,
                    deliveryFee: cartItem.deliveryFee,
                    deliveryMethod: cartItem.deliveryMethod,
                    deliveryArea: cartItem.deliveryArea,
                    deliveryPickupLocation: cartItem.deliveryPickupLocation,
                    houseNo: cartItem.houseNo,
                    apartment: cartItem.apartment,
                    city: cartItem.city,
                    street: cartItem.street,
                    isGift: cartItem.isGift,
                    additionalInfo: cartItem.additionalInfo,
                    amount: ticketInfo?.price?.sellingPrice || 0,
                    loggedInUserId: updateOrder.userId,
                    orderId: updateOrder.id,
                    itemType: cartItem.itemType,
                  }),
                ];
              }

              const ticketQuantity = cartItem.quantity || 1;
              const orderProductPromises = Array.from(
                { length: ticketQuantity },
                () => this.orderProductService.create({
                  itemId: new mongoose.Types.ObjectId(cartItem.id),
                  quantity: 1, // Always 1 per TICKET
                  email: cartItem.email,
                  countryCode: cartItem.countryCode,
                  phone: cartItem.phone,
                  firstName: cartItem.firstName,
                  lastName: cartItem.lastName,
                  deliveryFee: cartItem.deliveryFee,
                  deliveryMethod: cartItem.deliveryMethod,
                  deliveryArea: cartItem.deliveryArea,
                  deliveryPickupLocation: cartItem.deliveryPickupLocation,
                  houseNo: cartItem.houseNo,
                  apartment: cartItem.apartment,
                  city: cartItem.city,
                  street: cartItem.street,
                  isGift: cartItem.isGift,
                  additionalInfo: cartItem.additionalInfo,
                  amount: ticketInfo?.price?.sellingPrice || 0,
                  loggedInUserId: updateOrder.userId,
                  orderId: updateOrder.id,
                  itemType: cartItem.itemType,
                  // this whole handler only runs after payment success, and
                  // tickets have no shipping step - fulfilled the instant
                  // they're purchased, so skip PROCESSING entirely
                  status: OrderStatus.COMPLETED,
                  completed: { date: new Date(), isAutomatic: true },
                }),
              );
              return Promise.all(orderProductPromises);
            }),
        );
        const orderProduct = orderProductArrays.flat();

        await this.sendEmailPostTicketPayment(
          getTicketsInformation,
          updateOrder,
          orderProduct,
          externalApi,
          languagePreference,
        );

        // Ticket-only order is done instantly - nothing else rolls
        // Order.status up from its order-products, so set it here.
        if (!findCartProducts?.length) {
          await updateById<Order>(this.OrderModel, updateOrder._id, {
            status: OrderStatus.COMPLETED,
          });
          updateOrder.status = OrderStatus.COMPLETED;
        }
      }

      return {
        updateOrder,
        getProductInformation: [
          ...getProductsInformation,
          ...getTicketsInformation,
        ],
      };
    } catch (err) {
      this.logger.error('[ORDER]: FAILED TO UPDATE AFTER PAYMENT SUCCESS', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  private async createVendorSplitOrdersForVoucher(
    parentOrder: Order,
    cart: Cart,
    externalApi: any,
  ): Promise<{ updateOrder: Order; getProductInformation: Product[] }> {
    const vendorOrders = await Promise.all(
      cart.vendorProducts.map(async vendor => {
        const vendorOrder = new this.OrderModel({
          products: vendor.products.map(p => ({ id: p._id })),
          userId: parentOrder.userId,
          email: parentOrder.email || cart.email,
          countryCode: parentOrder.countryCode,
          phone: parentOrder.phone || cart.phone,
          firstName: parentOrder.firstName || cart.name,
          lastName: parentOrder.lastName,
          address: parentOrder.address || cart.address,
          paymentStatus: PaymentStatus.SUCCESS,
          status: OrderStatus.PROCESSING,
          paymentMode: parentOrder.paymentMode,
          voucher: parentOrder.voucher,
          totalAmount: vendor.totalAmount,
          creditCardPayment: 0,
          deliveryFee: vendor.deliveryFee || 0,
          externalApiId: parentOrder.externalApiId,
          campId: parentOrder.campId,
          qrCodeUrl: '',
          paymentDate: new Date(),
          vendorId: vendor._id,
          parentOrderId: parentOrder._id,
          createdBy: parentOrder.userId,
          createdAt: new Date(),
        });

        const savedOrder = await vendorOrder.save();

        try {
          const { qrCodeUrl } = await this.generateQRCodeAndToken(
            savedOrder._id.toString(),
            vendor._id.toString(),
          );
          await updateById(this.OrderModel, savedOrder._id.toString(), {
            qrCodeUrl,
          });
          savedOrder.qrCodeUrl = qrCodeUrl;
        } catch (qrError) {
          this.logger.warn('[ORDER]: VENDOR QR CODE GENERATION FAILED', {
            vendorOrderId: savedOrder._id,
            vendorId: vendor._id,
            error: qrError instanceof Error ? qrError.message : String(qrError),
          });
        }

        return savedOrder;
      }),
    );

    this.logger.info(
      '[ORDER]: VENDOR SPLIT ORDERS CREATED FROM VOUCHER PAYMENT',
      {
        parentOrderId: parentOrder._id,
        vendorOrderIds: vendorOrders.map(o => o._id),
      },
    );

    // Deduct quantity for all product-type items
    const allProductItems = cart.vendorProducts.flatMap(vendor => vendor.products
      .filter(p => p.itemType === OrderItemType.PRODUCT)
      .map(p => ({
        id: p._id,
        quantity: p.quantity,
        itemType: p.itemType,
      })));

    if (allProductItems.length) {
      await this.productsService.deductQuantity(allProductItems);
    }

    // Get product information for calculating amounts
    const productInfoMap = {};
    if (allProductItems.length) {
      const productInfo
        = await this.productsService.getProductInformationForOrders(
          allProductItems,
        );
      productInfo.forEach(p => {
        productInfoMap[p._id.toString()] = p;
      });
    }

    // Create order product records for each vendor order
    const orderProductsPerVendor = await Promise.all(
      vendorOrders.map(async (vendorOrder, index) => {
        const vendor = cart.vendorProducts[index];
        const totalQty = vendor.products.reduce(
          (sum, prod) => sum + prod.quantity,
          0,
        );
        const created = await Promise.all(
          vendor.products.map(p => {
            const productDeliveryFee
              = totalQty > 0
                ? Math.round(
                  (((vendor.deliveryFee || 0) * p.quantity) / totalQty) * 100,
                ) / 100
                : 0;
            const productInfo = productInfoMap[p._id.toString()];
            const amount = productInfo?.price?.sellingPrice || 0;
            const isTicket = p.itemType === OrderItemType.TICKET;
            return this.orderProductService.create({
              itemId: new mongoose.Types.ObjectId(p._id.toString()),
              quantity: p.quantity,
              email: vendorOrder.email,
              countryCode: vendorOrder.countryCode,
              phone: vendorOrder.phone,
              firstName: vendorOrder.firstName,
              lastName: vendorOrder.lastName,
              deliveryFee: productDeliveryFee,
              deliveryMethod: vendor.deliveryMethod,
              deliveryArea: vendor.deliveryArea,
              deliveryPickupLocation: vendor.deliveryPickupLocation,
              houseNo: vendor.houseNo?.toString() || null,
              apartment: vendor.apartment?.toString() || null,
              city: vendor.city?.toString() || null,
              street: vendor.street?.toString() || null,
              isGift: false,
              additionalInfo: vendor.additionalInfo?.toString() || null,
              amount,
              orderId: vendorOrder.id,
              loggedInUserId: parentOrder.userId?.toString(),
              itemType: p.itemType,
              // tickets have no shipping step - fulfilled instantly on
              // purchase, so skip PROCESSING (products keep the default)
              ...(isTicket && {
                status: OrderStatus.COMPLETED,
                completed: { date: new Date(), isAutomatic: true },
              }),
            });
          }),
        );

        // Tickets are COMPLETED but nothing rolls vendorOrder.status up
        // automatically - sync it here or it stays stuck at PROCESSING.
        if (vendor.products.every(p => p.itemType === OrderItemType.TICKET)) {
          await updateById<Order>(this.OrderModel, vendorOrder._id, {
            status: OrderStatus.COMPLETED,
          });
          Object.assign(vendorOrder, { status: OrderStatus.COMPLETED });
        }

        return created;
      }),
    );

    if (externalApi) {
      await this.sendEmailPostVendorOrderPayment(
        cart,
        parentOrder,
        vendorOrders,
        orderProductsPerVendor.flat(),
        externalApi,
      );
    }

    // Parent order is preserved - never deleted to prevent data loss
    this.logger.info(
      '[ORDER]: PARENT COMBO ORDER PRESERVED AFTER VENDOR SPLIT FROM VOUCHER',
      {
        parentOrderId: parentOrder._id,
        vendorOrdersCount: vendorOrders.length,
      },
    );

    return {
      updateOrder: parentOrder,
      getProductInformation: [],
    };
  }

  private async createVendorSplitOrders(
    parentOrder: Order,
    cart: Cart,
    externalApi: any,
  ): Promise<{ updateOrder: Order; getProductInformation: Product[] }> {
    const totalVendorsAmount = cart.vendorProducts.reduce(
      (sum, vendor) => sum + vendor.totalAmount + (vendor.deliveryFee || 0),
      0,
    );

    const vendorOrders = await Promise.all(
      cart.vendorProducts.map(async vendor => {
        const vendorGrossAmount
          = Math.round((vendor.totalAmount + (vendor.deliveryFee || 0)) * 100)
          / 100;
        const vendorCreditCardPayment
          = totalVendorsAmount > 0
            ? Math.round(
              parentOrder.creditCardPayment
              * (vendorGrossAmount / totalVendorsAmount)
              * 100,
            ) / 100
            : vendorGrossAmount;

        const vendorOrder = new this.OrderModel({
          products: vendor.products.map(p => ({ id: p._id })),
          userId: parentOrder.userId,
          email: parentOrder.email || cart.email,
          countryCode: parentOrder.countryCode,
          phone: parentOrder.phone || cart.phone,
          firstName: parentOrder.firstName || cart.name,
          lastName: parentOrder.lastName,
          address: parentOrder.address || cart.address,
          paymentStatus: PaymentStatus.SUCCESS,
          status: OrderStatus.PROCESSING,
          paymentMode: parentOrder.paymentMode,
          voucher: parentOrder.voucher,
          totalAmount: vendorGrossAmount,
          creditCardPayment: vendorCreditCardPayment,
          deliveryFee: vendor.deliveryFee || 0,
          externalApiId: parentOrder.externalApiId,
          campId: parentOrder.campId,
          // qrCodeUrl: parentOrder.qrCodeUrl,
          qrCodeUrl: '', // Will be set after order is saved
          paymentDate: new Date(),
          vendorId: vendor._id,
          parentOrderId: parentOrder._id,
          createdBy: parentOrder.userId,
          createdAt: new Date(),
        });

        const savedOrder = await vendorOrder.save();

        // Generate vendor-specific QR code
        try {
          const { qrCodeUrl } = await this.generateQRCodeAndToken(
            savedOrder._id.toString(),
            vendor._id.toString(), // Pass vendorId for vendor-specific token
          );
          await updateById(this.OrderModel, savedOrder._id.toString(), {
            qrCodeUrl,
          });
          savedOrder.qrCodeUrl = qrCodeUrl;
        } catch (qrError) {
          this.logger.warn('[ORDER]: VENDOR QR CODE GENERATION FAILED', {
            vendorOrderId: savedOrder._id,
            vendorId: vendor._id,
            error: qrError instanceof Error ? qrError.message : String(qrError),
          });
        }

        return savedOrder;
      }),
    );

    this.logger.info(
      '[ORDER]: VENDOR SPLIT ORDERS CREATED AFTER PAYMENT SUCCESS',
      {
        parentOrderId: parentOrder._id,
        vendorOrderIds: vendorOrders.map(o => o._id),
      },
    );

    // Deduct quantity for all product-type items across vendors
    const allProductItems = cart.vendorProducts.flatMap(vendor => vendor.products
      .filter(p => p.itemType === OrderItemType.PRODUCT)
      .map(p => ({
        id: p._id,
        quantity: p.quantity,
        itemType: p.itemType,
      })));

    if (allProductItems.length) {
      await this.productsService.deductQuantity(allProductItems);
    }

    // Get product information for calculating amounts
    const productInfoMap = {};
    if (allProductItems.length) {
      const productInfo
        = await this.productsService.getProductInformationForOrders(
          allProductItems,
        );
      productInfo.forEach(p => {
        productInfoMap[p._id.toString()] = p;
      });
    }

    // Create order product records for each vendor order
    const orderProductsPerVendor = await Promise.all(
      vendorOrders.map(async (vendorOrder, index) => {
        const vendor = cart.vendorProducts[index];
        const totalQty = vendor.products.reduce(
          (sum, prod) => sum + prod.quantity,
          0,
        );
        const created = await Promise.all(
          vendor.products.map(p => {
            // Divide delivery fee proportionally by quantity for all models
            const productDeliveryFee
              = totalQty > 0
                ? Math.round(
                  (((vendor.deliveryFee || 0) * p.quantity) / totalQty) * 100,
                ) / 100
                : 0;
            const productInfo = productInfoMap[p._id.toString()];
            const amount = productInfo?.price?.sellingPrice || 0;
            const isTicket = p.itemType === OrderItemType.TICKET;
            return this.orderProductService.create({
              itemId: new mongoose.Types.ObjectId(p._id.toString()),
              quantity: p.quantity,
              email: vendorOrder.email,
              countryCode: vendorOrder.countryCode,
              phone: vendorOrder.phone,
              firstName: vendorOrder.firstName,
              lastName: vendorOrder.lastName,
              deliveryFee: productDeliveryFee,
              deliveryMethod: vendor.deliveryMethod,
              deliveryArea: vendor.deliveryArea,
              deliveryPickupLocation: vendor.deliveryPickupLocation,
              houseNo: vendor.houseNo?.toString() || null,
              apartment: vendor.apartment?.toString() || null,
              city: vendor.city?.toString() || null,
              street: vendor.street?.toString() || null,
              isGift: false,
              additionalInfo: vendor.additionalInfo?.toString() || null,
              amount,
              orderId: vendorOrder.id,
              loggedInUserId: parentOrder.userId?.toString(),
              itemType: p.itemType,
              // tickets have no shipping step - fulfilled instantly on
              // purchase, so skip PROCESSING (products keep the default)
              ...(isTicket && {
                status: OrderStatus.COMPLETED,
                completed: { date: new Date(), isAutomatic: true },
              }),
            });
          }),
        );

        // Tickets are COMPLETED but nothing rolls vendorOrder.status up
        // automatically - sync it here or it stays stuck at PROCESSING.
        if (vendor.products.every(p => p.itemType === OrderItemType.TICKET)) {
          await updateById<Order>(this.OrderModel, vendorOrder._id, {
            status: OrderStatus.COMPLETED,
          });
          Object.assign(vendorOrder, { status: OrderStatus.COMPLETED });
        }

        return created;
      }),
    );

    if (externalApi) {
      await this.sendEmailPostVendorOrderPayment(
        cart,
        parentOrder,
        vendorOrders,
        orderProductsPerVendor.flat(),
        externalApi,
      );
    }

    // Parent order is preserved - never deleted to prevent data loss
    this.logger.info(
      '[ORDER]: PARENT COMBO ORDER PRESERVED AFTER VENDOR SPLIT',
      {
        parentOrderId: parentOrder._id,
        vendorOrdersCount: vendorOrders.length,
      },
    );

    return {
      updateOrder: parentOrder,
      getProductInformation: [],
    };
  }

  private async sendEmailPostVendorOrderPayment(
    cart: Cart,
    parentOrder: Order,
    vendorOrders: Order[],
    allOrderProducts: OrderProduct[],
    externalApi: any,
  ) {
    const allProductIds = cart.vendorProducts.flatMap(vendor => vendor.products.map(p => p._id.toString()));

    const [productInfo, businessDetails] = await Promise.all([
      this.productsService.getProductInformationForOrders(
        allProductIds.map(id => ({ id })),
      ),
      this.businessService.findBusinessEmailByIds(
        vendorOrders.map(o => o.vendorId as any),
      ),
    ]);

    const { emailFields } = await getCommonEmailFields(
      externalApi,
      this.docUploadService,
    );

    const orderEmailFields = {
      ...emailFields,
      BUTTON_LINK: externalApi?.websiteUrl,
    };

    const buildProductRow = (
      product: any,
      quantity: number,
      price: number,
      extraFields = '',
    ) => {
      const totalPrice = quantity * price;
      const productImage
        = product?.images?.[0]?.image || 'https://placehold.net/400x400.png';
      return `
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
        <tr>
          <td style="padding: 10px; background: ${hexToRgba(
    externalApi?.primaryColor,
    0.3,
  )}; direction: rtl; border-radius: 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding: 0; vertical-align: middle;">
                  <img src="${productImage}" alt="${product?.name}"
                    style="max-width: 100px; height: 100px; margin-left: 10px; display: block;">
                </td>
                <td style="padding: 0 10px; vertical-align: middle;" width="100%">
                  <span style="display: block; font-size: 18px; color: #333333;">${product?.name
}</span>
                  <span style="display: block; font-size: 14px; color: #666666;">כמות: ${quantity}</span>
                  <span style="display: block; font-size: 14px; color: #666666;">סה״כ מחיר: ${quantity} × ₪${price} = ₪${totalPrice}</span>
                  ${extraFields}
                </td>
                <td style="padding: 0; vertical-align: middle; white-space: nowrap;">
                  <span dir="rtl" style="font-size: 16px; color: #333333;">₪${totalPrice}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
    };

    // Customer email — group products by vendor with QR codes
    const emailToGroupMap: {
      [email: string]: {
        buyerName: string;
        vendorGroups: {
          vendorId: string;
          vendorName: string;
          vendorEmail: string;
          vendorPhone: string;
          productsHtml: string;
          qrCodeUrl: string;
          color: string;
          subtotal: number;
          vendorDeliveryFee: number;
          totalQuantity: number;
          perUnitDeliveryFee: number;
          isPricePerProduct: boolean;
        }[];
        totalAmount: number;
        totalDeliveryFee: number;
      };
    } = {};

    allOrderProducts.forEach(orderItem => {
      const product = productInfo?.find(
        p => p._id.toString() === orderItem.itemId.toString(),
      );
      if (!product) return;

      const { email } = orderItem;
      const price = orderItem.amount || product?.price?.sellingPrice || 0;
      const quantity = orderItem.quantity || 1;
      const deliveryFee = orderItem.deliveryFee || 0;

      const business = businessDetails?.find(b => {
        const vendorOrder = vendorOrders.find(
          vo => vo.vendorId?.toString() === b._id?.toString(),
        );
        return vendorOrder?.products?.some(
          vp => vp.id?.toString() === orderItem.itemId?.toString(),
        );
      });

      if (!emailToGroupMap[email]) {
        emailToGroupMap[email] = {
          buyerName: orderItem.firstName,
          vendorGroups: [],
          totalAmount: 0,
          totalDeliveryFee: 0,
        };
      }

      if (business) {
        const vendorId = business._id?.toString();
        let vendorGroup = emailToGroupMap[email].vendorGroups.find(
          vg => vg.vendorId === vendorId,
        );

        if (!vendorGroup) {
          const vendorOrder = vendorOrders.find(
            vo => vo.vendorId?.toString() === vendorId,
          );
          const isPricePerProduct = business?.vendorDelivers === true;
          vendorGroup = {
            vendorId,
            vendorName: business.name || '',
            vendorEmail: business.busiEmail || '',
            vendorPhone: business.phoneNumber || '',
            productsHtml: '',
            qrCodeUrl: vendorOrder?.qrCodeUrl || '',
            color: externalApi?.primaryColor || '#000000',
            subtotal: 0,
            vendorDeliveryFee: 0,
            totalQuantity: 0,
            perUnitDeliveryFee: 0,
            isPricePerProduct,
          };
          emailToGroupMap[email].vendorGroups.push(vendorGroup);
        }

        vendorGroup.productsHtml += buildProductRow(
          product,
          quantity,
          price,
          '',
        );
        vendorGroup.subtotal += price * quantity;
        vendorGroup.vendorDeliveryFee += deliveryFee;
        vendorGroup.totalQuantity += quantity;
        vendorGroup.perUnitDeliveryFee
          = vendorGroup.totalQuantity > 0
            ? Math.round(
              (vendorGroup.vendorDeliveryFee / vendorGroup.totalQuantity)
              * 100,
            ) / 100
            : 0;
      }

      emailToGroupMap[email].totalAmount += price * quantity;
      emailToGroupMap[email].totalDeliveryFee += deliveryFee;
    });

    await Promise.all(
      Object.entries(emailToGroupMap).map(([email, group]) => {
        const vendorsWithQrHtml = group.vendorGroups
          .map(vendor => {
            const vendorTotal = vendor.subtotal + vendor.vendorDeliveryFee;
            return `
            <div style="margin-bottom: 30px; padding: 20px; background: #ffffff; border-radius: 10px; border: 1px solid #e0e0e0;">
              <div style="border-bottom: 2px solid #e0e0e0; padding-bottom: 15px; margin-bottom: 15px;">
                <span style="display: block; font-size: 18px; font-weight: bold; color: #333333; text-align: right;">${vendor.vendorName
}</span>
                <span style="display: block; font-size: 13px; color: #666666; text-align: right; margin-top: 8px;">דוא"ל: ${vendor.vendorEmail
}</span>
                <span style="display: block; font-size: 13px; color: #666666; text-align: right;">טלפון: ${vendor.vendorPhone
}</span>
              </div>
              ${vendor.productsHtml}
              <div style="margin-top: 15px; padding: 12px; background: ${hexToRgba(
    externalApi?.primaryColor,
    0.05,
  )}; border-radius: 6px; direction: rtl;">
                <span style="display: block; font-size: 13px; color: #666666; margin-bottom: 6px;">סה״כ מוצרים: ₪${vendor.subtotal
}</span>
                <span style="display: block; font-size: 13px; color: #666666; margin-bottom: 6px;">דמי משלוח: ${vendor.isPricePerProduct
    ? `₪${vendor.perUnitDeliveryFee} × ${vendor.totalQuantity} = ₪${vendor.vendorDeliveryFee}`
    : `₪${vendor.vendorDeliveryFee}`
}</span>
                <span style="display: block; font-size: 16px; font-weight: bold; color: #333333;">סה״כ עבור ${vendor.vendorName
}: ₪${vendorTotal}</span>
              </div>
              <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #333333; direction: rtl;">סרוק את ה-QR לאיסוף עצמי:</p>
                <img src="${vendor.qrCodeUrl
}" alt="QR" style="width: 150px; height: 150px; margin: 10px auto; display: block; border: 3px solid ${vendor.color
};">
              </div>
            </div>
          `;
          })
          .join('');

        // Commented out: Total shipping costs summary (redundant with vendor-level breakdown)
        // const totalDeliveryFeeHtml = group.totalDeliveryFee > 0
        //   ? `<table cellpadding="0" cellspacing="0" border="0" width="100%"
        //       style="margin-top: 20px;">
        //       <tr>
        //         <td style="padding: 15px; background:
        //           ${hexToRgba(externalApi?.primaryColor, 0.1)}; direction: rtl;
        //           border-radius: 10px;">
        //           <span style="display: block; font-size: 16px; font-weight: bold;
        //             color: #333333;">דמי משלוח כוללים</span>
        //           <span style="display: block; font-size: 14px; color: #666666;
        //             margin-top: 5px;">סה״כ: ₪${group.totalDeliveryFee}</span>
        //         </td>
        //       </tr>
        //     </table>`
        //   : '';
        const totalDeliveryFeeHtml = '';

        return this.mailchimpService.sendTransactionalEmail({
          to: email,
          templatedId:
            DynamicEmailTemplate.OrderConfirmationForClientMultiVendor,
          from_email: externalApi?.companyDetails?.email,
          from_name: externalApi?.name,
          subject: 'הזמנתך התקבלה',
          mergeVars: {
            ...orderEmailFields,
            VENDORS_WITH_QR_HTML: vendorsWithQrHtml,
            DELIVERY_FEE_SUMMARY: totalDeliveryFeeHtml,
            BUYERNAME: group.buyerName || '',
            TOTALAMOUNT: group.totalAmount + group.totalDeliveryFee || 0,
            CHANGE_SETTINGS_LINK: externalApi?.websiteUrl,
            ORDER_HISTORY_LINK: `${externalApi?.websiteUrl}/order-history`,
            COLOR: externalApi?.primaryColor || '#000000',
          },
        });
      }),
    );

    // Vendor email — one per vendor
    await Promise.all(
      vendorOrders.map(async vendorOrder => {
        const business = businessDetails?.find(
          b => b._id?.toString() === vendorOrder.vendorId?.toString(),
        );

        if (!business?.busiEmail) return;

        const vendorOrderProducts = allOrderProducts.filter(op => vendorOrder.products.some(
          vp => vp.id?.toString() === op.itemId?.toString(),
        ));

        const vendor = cart.vendorProducts.find(
          v => v._id?.toString() === vendorOrder.vendorId?.toString(),
        );
        const isPricePerProduct = vendor?.isPricePerProduct === true;

        let vendorTotalAmount = 0;
        let totalVendorDeliveryFee = 0;

        const productsHtml = vendorOrderProducts
          .map(orderItem => {
            const product = productInfo?.find(
              p => p._id.toString() === orderItem.itemId.toString(),
            );
            if (!product) return '';

            const quantity = orderItem.quantity || 1;
            const price = orderItem.amount || product?.price?.sellingPrice || 0;
            const totalProductPrice = quantity * price;
            const deliveryFee = orderItem.deliveryFee || 0;
            const totalWithDelivery = isPricePerProduct
              ? totalProductPrice + deliveryFee
              : totalProductPrice;
            const vendorProductImage
              = product?.images?.[0]?.image
              || 'https://placehold.net/400x400.png';
            const address
              = orderItem.deliveryMethod === DeliveryMethod.DELIVER
                ? [
                  orderItem.houseNo,
                  orderItem.apartment,
                  orderItem.street,
                  orderItem.city,
                  orderItem.deliveryArea,
                ]
                  .filter(Boolean)
                  .join(', ')
                || orderItem.deliveryPickupLocation
                || ''
                : `מיקום העסק שלך - ${business?.address?.location}`;

            vendorTotalAmount
              += totalProductPrice + (isPricePerProduct ? deliveryFee : 0);
            totalVendorDeliveryFee += deliveryFee;

            const shippingFeeHtml = isPricePerProduct
              ? `<span style="display: block; font-size: 14px; color: #666666;">דמי משלוח: ${quantity} × ₪${Math.round((deliveryFee / quantity) * 100) / 100
              } = ₪${deliveryFee}</span>`
              : '';

            return `
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px; background: ${hexToRgba(
    externalApi?.primaryColor,
    0.3,
  )}; direction: rtl; border-radius: 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 0; vertical-align: middle;">
                          <img src="${vendorProductImage}" alt="${product?.name
}"
                            style="max-width: 100px; height: 100px; margin-left: 10px; display: block;">
                        </td>
                        <td style="padding: 0 10px; vertical-align: middle;" width="100%">
                          <span style="display: block; font-size: 16px; color: #333333;">${product?.name
}</span>
                          <span style="display: block; font-size: 14px; color: #666666;">כמות: ${quantity}</span>
                          <span style="display: block; font-size: 14px; color: #666666;">סה״כ מחיר: ${quantity} × ₪${price} = ₪${totalProductPrice}</span>
                          <span style="display: block; font-size: 14px; color: #666666;">שיטת משלוח: ${orderItem.deliveryMethod === DeliveryMethod.DELIVER
    ? 'לספק ללקוח'
    : 'איסוף עצמי על ידי הלקוח'
}</span>
                          ${shippingFeeHtml}
                          <span style="display: block; font-size: 14px; color: #666666;">כְּתוֹבֶת: ${address || 'לא ישים'
}</span>
                        </td>
                        <td style="padding: 0; vertical-align: middle; white-space: nowrap;">
                          <span dir="rtl" style="font-size: 16px; color: #333333;">₪${totalWithDelivery}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            `;
          })
          .join('');

        const orderShippingFeeHtml
          = !isPricePerProduct && totalVendorDeliveryFee > 0
            ? `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 20px;">
              <tr>
                <td style="padding: 15px; background: ${hexToRgba(
    externalApi?.primaryColor,
    0.1,
  )}; direction: rtl; border-radius: 10px;">
                  <span style="display: block; font-size: 16px; font-weight: bold; color: #333333;">דמי משלוח כוללים</span>
                  <span style="display: block; font-size: 14px; color: #666666; margin-top: 5px;">סה״כ: ₪${totalVendorDeliveryFee}</span>
                </td>
              </tr>
            </table>`
            : '';

        const buyerAddress = this.extractBuyerAddress(
          vendorOrderProducts,
          parentOrder?.address || '',
        );

        const { FE } = this.configService.baseUrl;
        const workspaceLink = FE;

        if (!isPricePerProduct) {
          vendorTotalAmount += totalVendorDeliveryFee;
        }

        await this.mailchimpService.sendTransactionalEmail({
          to: business.busiEmail,
          templatedId: DynamicEmailTemplate.OrderConfirmationForVendor,
          from_email: externalApi?.companyDetails?.email,
          from_name: externalApi?.name,
          mergeVars: {
            ...orderEmailFields,
            WEBSITE_NAME: externalApi?.name,
            BUSINESSNAME: business?.name || '',
            BUSINESSPHONE:
              `${business?.countryCode}-${business?.phoneNumber}` || '',
            BUSINESSEMAIL: business?.busiEmail || '',
            TOTALAMOUNT: vendorTotalAmount || 0,
            BUYERNAME: parentOrder?.firstName || '',
            // PRODUCTS_HTML: productsHtml,
            PRODUCTS_HTML: productsHtml + orderShippingFeeHtml,
            BUYER_PHONE_NUMBER: parentOrder?.phone || '',
            BUYER_ORDER_EMAIL: parentOrder?.email || '',
            BUYER_ADDRESS: buyerAddress,
            QRCODEURL: '',
            WORKSPACE_LINK: workspaceLink,
          },
        });
      }),
    );
  }

  // Builds OrderProduct rows for a failed/expired order from its still-linked
  // cart snapshot - a historical record only, no stock deduction or emails.
  private async createOrderProductsForCancelledOrder(
    order: Order,
    reason: string = 'payment_failed_or_abandoned',
  ): Promise<void> {
    if (!order?.products?.length) return;

    let cart: Cart;
    try {
      cart = await this.cartService.findOneByOrderId(order._id.toString());
    } catch (err) {
      this.logger.warn(
        '[ORDER]: NO CART FOUND FOR CANCELLED ORDER - SKIPPING ORDER PRODUCT CREATION',
        {
          orderId: order._id,
          error: err instanceof Error ? err.message : String(err),
        },
      );
      return;
    }

    const isVendorCart = cart?.vendorProducts?.length
      && (!cart?.product || cart.product.length === 0);

    const items = isVendorCart
      ? cart.vendorProducts.flatMap(vendor => vendor.products.map(p => ({
        id: p._id,
        quantity: p.quantity,
        itemType: p.itemType,
        email: order.email,
        countryCode: order.countryCode,
        phone: order.phone,
        firstName: order.firstName,
        lastName: order.lastName,
        deliveryFee: vendor.deliveryFee || 0,
        deliveryMethod: vendor.deliveryMethod,
        deliveryArea: vendor.deliveryArea,
        deliveryPickupLocation: vendor.deliveryPickupLocation,
        houseNo: vendor.houseNo?.toString() || null,
        apartment: vendor.apartment?.toString() || null,
        city: vendor.city?.toString() || null,
        street: vendor.street?.toString() || null,
        isGift: false,
        additionalInfo: vendor.additionalInfo?.toString() || null,
      })))
      : cart?.product || [];

    if (!items.length) return;

    const productIds = items
      .filter(item => item.itemType === OrderItemType.PRODUCT)
      .map(item => item.id);
    const ticketIds = items
      .filter(item => item.itemType === OrderItemType.TICKET)
      .map(item => item.id.toString());

    const [productInfo, ticketInfo] = await Promise.all([
      productIds.length
        ? this.productsService
          .getProductInformationForOrders(
            productIds.map(id => ({
              id,
              quantity: 1,
              itemType: OrderItemType.PRODUCT,
            })),
          )
          .catch(() => [])
        : [],
      ticketIds.length
        ? this.queryBus
          .execute(new GetTicketByIdsQuery(ticketIds))
          .catch(() => [])
        : [],
    ]);

    const matches = order.products
      .map(product => ({
        product,
        item: items.find(
          item => item.id.toString() === product.id.toString(),
        ),
      }))
      .filter(({ item }) => item);

    await Promise.all(
      matches.map(({ item }) => {
        const priceInfo = item.itemType === OrderItemType.TICKET
          ? ticketInfo.find(
            (t: any) => t._id.toString() === item.id.toString(),
          )
          : productInfo.find(
            (p: any) => p._id.toString() === item.id.toString(),
          );

        return this.orderProductService.create({
          itemId: new mongoose.Types.ObjectId(item.id.toString()),
          quantity: item.quantity,
          email: item.email,
          countryCode: item.countryCode,
          phone: item.phone,
          firstName: item.firstName,
          lastName: item.lastName,
          deliveryFee: item.deliveryFee,
          deliveryMethod: item.deliveryMethod,
          deliveryArea: item.deliveryArea,
          deliveryPickupLocation: item.deliveryPickupLocation,
          houseNo: item.houseNo,
          apartment: item.apartment,
          city: item.city,
          street: item.street,
          isGift: item.isGift,
          additionalInfo: item.additionalInfo,
          amount: priceInfo?.price?.sellingPrice || 0,
          orderId: order._id.toString(),
          loggedInUserId: order.userId,
          itemType: item.itemType,
          status: OrderStatus.CANCELED,
          cancelled: {
            date: new Date(),
            isAutomatic: true,
            canceled_reason: reason,
          },
        });
      }),
    );

    this.logger.info('[ORDER]: CREATED ORDER PRODUCTS FOR CANCELLED ORDER', {
      orderId: order._id,
      count: matches.length,
    });
  }

  async updateAfterPaymentFailure(
    orderId: string,
    reason?: string,
  ): Promise<Order> {
    try {
      const updatedField = {
        paymentStatus: PaymentStatus.FAILURE,
        status: OrderStatus.CANCELED,
      };

      // Atomically claim this order for failure-handling: only proceed if it
      // is still PENDING. This prevents a duplicate trigger (e.g. the payment
      // gateway's failure webhook firing alongside the order-expiry cron) from
      // refunding the same order's voucher more than once.
      const claimedOrder = await this.OrderModel.findOneAndUpdate(
        { _id: orderId, paymentStatus: PaymentStatus.PENDING },
        updatedField,
      );

      if (!claimedOrder) {
        this.logger.info(
          '[ORDER]: SKIPPED PAYMENT FAILURE HANDLING — ALREADY PROCESSED',
          { orderId },
        );
        return await findOneById<Order>(this.OrderModel, orderId);
      }

      if (claimedOrder?.voucher && claimedOrder?.voucher?.length) {
        // update vouchers detail and add the deducted voucher amounts
        await this.voucherService.updateAmountAfterOrderFailed(
          claimedOrder.voucher,
        );
      }

      // Leaves an OrderProduct trail for the abandoned/failed checkout -
      // must never block the refund/cancellation above.
      try {
        await this.createOrderProductsForCancelledOrder(claimedOrder, reason);
      } catch (orderProductErr) {
        this.logger.warn(
          '[ORDER]: FAILED TO CREATE ORDER PRODUCTS FOR CANCELLED ORDER',
          {
            orderId,
            error:
              orderProductErr instanceof Error
                ? orderProductErr.message
                : String(orderProductErr),
          },
        );
      }

      const updateOrder = await findOneById<Order>(this.OrderModel, orderId);

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

  async updateOrderStatus(id: string, body: any): Promise<Order> {
    try {
      const orderExists = await findOneById<Order>(this.OrderModel, id);

      if (!orderExists) {
        throw new NotFoundException(ServerErrors.ORDERS.NOT_FOUND);
      }

      if (
        orderExists.status === OrderStatus.COMPLETED
        && body.status
        && body.status !== OrderStatus.COMPLETED
      ) {
        throw new BadRequestException('Completed orders cannot be changed');
      }

      const updateOrder = await updateById<Order>(this.OrderModel, id, body);

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

  async findOneById(id: string, populate?: string): Promise<Order> {
    try {
      let query = this.OrderModel.findOne({
        _id: id,
        deletedAt: { $in: [null] },
      });

      if (populate) {
        query = query.populate(populate);
      }

      const order = await query;

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

  async sendEmailPostTicketPayment(
    productInfo: Ticket[],
    order: Order,
    orderProduct: OrderProduct[],
    externalApi: any,
    languagePreference?: Locale,
  ) {
    this.logger.info('[EMAIL]: STARTING TICKET PAYMENT EMAIL FLOW', {
      ticketCount: productInfo?.length,
      orderId: order?._id,
      languagePreference,
    });

    const eventIds = productInfo.map(pro => pro.eventId);
    const uniqueEventIds = [
      ...new Set(eventIds.filter(Boolean).map(eventId => String(eventId))),
    ];
    const isSingleEventOrder = uniqueEventIds.length === 1;
    this.logger.info('[EMAIL]: EVENT IDS TO FETCH', {
      eventIds,
    });

    const eventDetails = await this.queryBus.execute(
      new GetEventByIdsQuery(eventIds),
    );
    this.logger.info('[EMAIL]: EVENT DETAILS FETCHED', {
      eventDetailsCount: eventDetails?.length,
      firstEventUserId: eventDetails?.[0]?.userId
        ? JSON.stringify(eventDetails?.[0]?.userId)
        : 'NOT_POPULATED',
    });

    const { emailFields } = await getCommonEmailFields(
      externalApi,
      this.docUploadService,
    );

    // Format event date and time for display
    const eventDate = eventDetails[0]?.dayDescription?.[0]?.date
      ? new Date(eventDetails[0].dayDescription[0].date).toLocaleDateString(
        'he-IL',
      )
      : '';
    const eventStartTime
      = eventDetails[0]?.dayDescription?.[0]?.startTime || '';
    const eventEndTime = eventDetails[0]?.dayDescription?.[0]?.endTime || '';
    const cleanString = (str: string) => {
      if (!str) return '';
      // Remove everything after special characters
      const cleaned = str.split(/[<>"&]/)[0];
      return cleaned.trim();
    };
    const eventLocation = cleanString(eventDetails[0]?.address?.location || '');
    const eventCity = cleanString(eventDetails[0]?.address?.city || '');
    const eventLocationForBusinessAddress = cleanString(
      eventDetails[0]?.address?.location || '',
    );

    // Only show time when the whole order belongs to one event.
    const EVENT_TIME
      = isSingleEventOrder && eventStartTime && eventEndTime
        ? `${eventStartTime} - ${eventEndTime}`
        : '';

    const orderEmailFields = {
      ...emailFields,
      BUTTON_LINK: externalApi?.websiteUrl,
      BUSINESSNAME:
        eventDetails[0]?.nameHe
        || eventDetails[0]?.name
        || eventDetails[0]?.nameAr
        || '',
      EVENT_DATE: eventDate,
      EVENT_START_TIME: eventStartTime || '',
      EVENT_END_TIME: eventEndTime || '',
      EVENT_TIME,
      EVENT_LOCATION: eventLocation,
      EVENT_CITY: eventCity,
    };

    const { FE } = this.configService.baseUrl;

    type EmailOrderGroup = {
      buyerName: string;
      products: {
        quantity: number;
        image?: any;
        name: string;
        price: number;
        deliveryFee: number;
        qrCodeUrl?: string;
        greeting?: string;
        wrapperId?: string;
        orderProductId?: string;
      }[];
      totalAmount: number;
    };

    const emailToProductsMap: { [email: string]: EmailOrderGroup } = {};

    // Process orderProducts sequentially to avoid QR generation rate limiting
    // eslint-disable-next-line no-await-in-loop
    for (let idx = 0; idx < orderProduct.length; idx++) {
      const orderItem = orderProduct[idx];
      // eslint-disable-next-line no-await-in-loop
      await (async () => {
        const { email } = orderItem;
        const product = productInfo.find(
          p => p._id.toString() === orderItem.itemId.toString(),
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

        // Find the correct event details for this specific ticket
        const eventDetailsForThisTicket = eventDetails.find(
          e => e._id.toString() === product.eventId.toString(),
        );

        if (!eventDetailsForThisTicket) {
          this.logger.warn('[EMAIL]: EVENT DETAILS NOT FOUND FOR TICKET', {
            productId: product._id,
            eventId: product.eventId,
          });
          return;
        }

        // Use event image for tickets (ticket image may be empty)
        const ticketImageUrl = product?.images?.[0]?.image;
        const eventImageUrl = eventDetailsForThisTicket?.images?.[0]?.image;
        const finalImageUrl = ticketImageUrl || eventImageUrl || '';

        this.logger.info('[EMAIL]: PRODUCT IMAGE DEBUG', {
          productId: product._id,
          productName: product?.name,
          ticketImageUrl,
          eventImageUrl,
          finalImageUrl,
          eventId: eventDetailsForThisTicket._id,
        });

        // Generate unique QR code for each ticket (if quantity > 1, create multiple QR codes)
        const qrCodeUrls: string[] = [];

        try {
          this.logger.info('[EMAIL]: QR GENERATION START', {
            eventId: eventDetailsForThisTicket?._id,
            quantity,
          });

          // Generate QR codes for each ticket sequentially - even if event creator is missing
          const successfulCodes = [];
          // eslint-disable-next-line no-restricted-syntax
          for (let qrIdx = 0; qrIdx < quantity; qrIdx++) {
            try {
              const ticketNum = qrIdx + 1;
              this.logger.info('[EMAIL]: GENERATING QR CODE FOR TICKET', {
                ticketNum,
              });

              // Generate QR code URL pointing to verify-ticket page
              const eventDetailsUrl = `${FE}verify-ticket/${eventDetailsForThisTicket?._id}/${orderItem._id}`;
              this.logger.info('[EMAIL]: QR CODE URL GENERATED', {
                ticketNum,
                eventDetailsUrl,
              });

              // Add small delay between QR generations to avoid rate limiting
              if (qrIdx > 0) {
                // eslint-disable-next-line no-await-in-loop
                await new Promise(resolve => setTimeout(resolve, 100));
              }

              this.logger.info('[EMAIL]: GENERATING QR CODE', {
                ticketNum,
                urlLength: eventDetailsUrl?.length,
              });

              // eslint-disable-next-line no-await-in-loop
              const qrCodeUrl = await this.qrCodeService.generateQRCode(
                eventDetailsUrl,
                `event-${eventDetailsForThisTicket?._id}-${orderItem._id}-ticket${ticketNum}`,
              );
              this.logger.info('[EMAIL]: QR CODE GENERATED SUCCESSFULLY', {
                ticketNum,
                qrCodeUrl,
              });
              successfulCodes.push(qrCodeUrl);
            } catch (ticketQrError) {
              this.logger.error(
                '[EMAIL]: QR CODE GENERATION FAILED FOR TICKET',
                {
                  ticketNum: qrIdx + 1,
                  reason:
                    ticketQrError instanceof Error
                      ? ticketQrError.message
                      : String(ticketQrError),
                },
              );
            }
          }

          this.logger.info('[EMAIL]: ALL QR CODES GENERATED', {
            quantity,
            generatedCount: successfulCodes.length,
            codes: successfulCodes,
          });
          qrCodeUrls.push(...successfulCodes);
        } catch (qrError) {
          this.logger.error('[EMAIL]: FAILED TO GENERATE TICKET QR CODE', {
            eventId: eventDetailsForThisTicket?._id,
            orderProductId: orderItem._id,
            quantity,
            error: qrError instanceof Error ? qrError.message : String(qrError),
            stack: qrError instanceof Error ? qrError.stack : undefined,
          });
        }

        // Add one product entry per ticket with its corresponding QR code
        // Add even if QR generation failed (QR code will be empty string)
        for (let i = 0; i < quantity; i++) {
          const qrUrl = qrCodeUrls[i] || '';
          emailToProductsMap[email].products.push({
            quantity: 1,
            image: finalImageUrl,
            name: product?.name,
            price,
            deliveryFee: 0, // Delivery fee counted once in total, not per ticket
            qrCodeUrl: qrUrl,
            greeting: product?.greeting,
            wrapperId: product?.wrapperId || '',
            orderProductId: orderItem._id?.toString(),
          });

          this.logger.info('[EMAIL]: TICKET PRODUCT ADDED', {
            ticketNum: i + 1,
            qrUrl,
            hasQrUrl: !!qrUrl,
          });
        }

        this.logger.info('[EMAIL]: PRODUCTS ADDED TO EMAIL MAP', {
          email,
          productsCount: emailToProductsMap[email].products.length,
          qrCodesGenerated: qrCodeUrls.length,
          quantityOrdered: quantity,
          allQrUrls: qrCodeUrls,
        });

        // Always save QR codes to orderProduct record, even if empty
        // This ensures the orderProduct is marked as processed
        try {
          const qrUrlString
            = qrCodeUrls.length > 0 ? qrCodeUrls.join('|') : null;
          await updateById(this.OrderProductModel, orderItem._id.toString(), {
            qrCodeUrl: qrUrlString,
          });
          this.logger.info('[EMAIL]: QR CODE SAVED TO ORDER PRODUCT', {
            orderProductId: orderItem._id,
            qrCodeUrl: qrUrlString,
            qrCount: qrCodeUrls.length,
          });
        } catch (error) {
          this.logger.error(
            '[EMAIL]: FAILED TO SAVE QR CODE TO ORDER PRODUCT',
            {
              orderProductId: orderItem._id,
              error: error instanceof Error ? error.message : String(error),
            },
          );
        }

        emailToProductsMap[email].totalAmount += price * quantity + deliveryFee;
      })();
    }

    this.logger.info('[EMAIL]: SENDING CUSTOMER EMAILS', {
      emailCount: Object.keys(emailToProductsMap).length,
      emails: Object.keys(emailToProductsMap),
    });

    // ── Check if event is LUMEN-enabled (has wrapperIds) ────────────────────────
    const eventWrapperIds = eventDetails[0]?.wrapperIds;
    const eventWrapperId
      = eventWrapperIds && eventWrapperIds.length > 0 ? eventWrapperIds[0] : null;
    const eventCode = eventDetails[0]?.code || eventDetails[0]?.eventCode;

    // ── Send OLD email ONLY if NO session wrapper ──────────────────────────────
    if (!eventWrapperId) {
      // Send separate email per ticket (product)
      await Promise.all(
        Object.entries(emailToProductsMap).map(async ([email, group]) => {
          this.logger.info('[EMAIL]: SENDING TO CUSTOMER', { email });

          // Send one email per ticket (product)
          await Promise.all(
            group.products.map(async (product: any) => {
              const productHtml = `
            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="tcc-card-desktop" style="margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; background: #f9f9f9; direction: rtl; border-radius: 20px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 0; vertical-align: top; text-align: center; width: 120px; padding-left: 10px;">
                        <img src="${product?.image || ''}" alt="${product?.name
}" style="max-width: 120px; height: 120px; border-radius: 8px; display: block;">
                      </td>
                      <td style="padding: 0; vertical-align: top; padding-left: 10px;">
                        <span style="display: block; font-size: 16px; color: #333333; margin-bottom: 5px;">${product?.name
}</span>
                        <span style="display: block; font-size: 14px; color: #666666; margin-bottom: 8px;">כמות: ${product?.quantity
}</span>
                        <span style="display: block; font-size: 16px; color: #333333;">₪${product?.price
}</span>
                      </td>
                      <td style="padding: 0; vertical-align: top; text-align: center; width: 110px; padding-left: 10px;">
                        ${product?.qrCodeUrl
    ? `
                          ${product?.qrCodeUrl
    .split('|')
    .map(
      (qrUrl, idx) => `
                            <img src="${qrUrl}" alt="QR Code ${idx + 1
}" style="width: 100px; height: 100px; border: 3px solid ${externalApi?.primaryColor
}; margin-bottom: 10px;">
                          `,
    )
    .join('')}
                        `
    : ''
}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="tcc-card-mobile" style="display: none; margin-bottom: 20px;">
              <tr>
                <td style="padding: 14px; background: #f9f9f9; direction: rtl; border-radius: 20px; text-align: center;">
                  <img src="${product?.image || ''}" alt="${product?.name
}" style="width: 100%; max-width: 220px; height: auto; border-radius: 8px; display: block; margin: 0 auto 12px;">
                  <span style="display: block; font-size: 18px; color: #333333; margin-bottom: 8px;">${product?.name
}</span>
                  <span style="display: block; font-size: 14px; color: #666666; margin-bottom: 8px;">כמות: ${product?.quantity
}</span>
                  <span style="display: block; font-size: 16px; color: #333333; margin-bottom: 12px;">₪${product?.price
}</span>
                  ${product?.qrCodeUrl
    ? `
                    ${product?.qrCodeUrl
    .split('|')
    .map(
      (qrUrl, idx) => `
                      <img src="${qrUrl}" alt="QR Code ${idx + 1
}" style="width: 160px; max-width: 60%; height: auto; border: 3px solid ${externalApi?.primaryColor
}; border-radius: 8px; display: block; margin: 0 auto 10px;">
                    `,
    )
    .join('')}
                  `
    : ''
}
                </td>
              </tr>
            </table>
            `;

              try {
                await this.mailchimpService.sendTransactionalEmail({
                  to: email,
                  templatedId:
                    DynamicEmailTemplate.TicketConfirmationForCustomers,
                  from_email: externalApi?.companyDetails?.email,
                  from_name: externalApi?.name,
                  mergeVars: {
                    ...orderEmailFields,
                    EVENT_NAME:
                      eventDetails[0]?.nameHe
                      || eventDetails[0]?.name
                      || eventDetails[0]?.nameAr
                      || '',
                    PRODUCTS_HTML: productHtml,
                    BUYERNAME: group.buyerName || '',
                    TOTALAMOUNT: product.price * product.quantity,
                    CHANGE_SETTINGS_LINK: externalApi?.websiteUrl,
                    BUSINESSADDRESS: eventLocationForBusinessAddress || '',
                    GREETING: product.greeting || '',
                  },
                });
                this.logger.info('[EMAIL]: TICKET EMAIL SENT', {
                  email,
                  productName: product.name,
                });
              } catch (err) {
                this.logger.error('[EMAIL]: FAILED TO SEND TICKET EMAIL', {
                  email,
                  productName: product.name,
                  error: err instanceof Error ? err.message : String(err),
                });
              }
            }),
          );
        }),
      );
    } // ← Close: if (!eventWrapperId)

    // ── Send NEW email ONLY if HAS session wrapper ───────────────────────────────
    if (eventWrapperId) {
      try {
        this.logger.info('[LUMEN]: SENDING SESSION BOOKING INVITATIONS', {
          eventWrapperId,
          eventCode,
          customerCount: Object.keys(emailToProductsMap).length,
        });

        // Send Email #2 to each customer - separate email per ticket
        await Promise.all(
          Object.entries(emailToProductsMap).map(async ([email, group]) => {
            try {
              // Find phone number from any orderProduct with this email
              // All orderProducts with same email should have same phone number
              const phoneFromOrder
                = orderProduct.find(op => op.email === email)?.phone || '';
              const primaryWrapperId
                = group.products.find(p => p.wrapperId)?.wrapperId
                || eventWrapperId;

              // Send one email per ticket (product)
              await Promise.all(
                group.products.map(async product => {
                  const productWrapperId
                    = product?.wrapperId || primaryWrapperId;

                  // Generate UNIQUE code per ticket (single-use)
                  // Format: TICKET-<random8chars>
                  const uniqueCode = `TICKET-${Math.random()
                    .toString(36)
                    .substring(2, 10)
                    .toUpperCase()}`;

                  // Generate encrypted invite token with single-use code
                  const { token, ttlDays }
                    = this.sessionBookingsService.generateInviteToken({
                      name: group.buyerName || '',
                      email,
                      phone: phoneFromOrder,
                      wrapperId: productWrapperId || eventWrapperId || '',
                      code: uniqueCode,
                      orderProductId: product.orderProductId,
                      // Pass the last event date so token expiry is capped to 1 day before
                      // the event rather than a flat 7 days (e.g. bought July 10, event July 22 → expires July 21)
                      eventLastDate: eventDetails[0]?.dayDescription?.length
                        ? new Date(
                          eventDetails[0].dayDescription[
                            eventDetails[0].dayDescription.length - 1
                          ].date,
                        )
                        : undefined,
                    });

                  // Create link to travel website's purchaser-verify page
                  // Travel website will decrypt and redirect to LUMEN
                  const purchaserVerifyLink = `${externalApi?.websiteUrl}/purchaser-verify?code=${token}`;

                  this.logger.info('[LUMEN]: SENDING TICKET EMAIL', {
                    email,
                    wrapperId: productWrapperId || eventWrapperId,
                    code: uniqueCode,
                    purchaserVerifyLink,
                    productName: product.name,
                  });

                  // Build single product HTML
                  // Two structurally-separate cards (desktop 3-column row vs. mobile
                  // 2-row layout) toggled via CSS, since table cell reordering isn't
                  // reliably supported across email clients (esp. Outlook desktop).
                  const productHtml = `
                <table cellpadding="0" cellspacing="0" border="0" width="100%" class="lsb-card-desktop" style="margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 14px; background: #f9f9f9; direction: rtl; border-radius: 20px;">
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="direction: rtl;">
                        <tr>
                          <td style="padding: 0 0 0 10px; vertical-align: middle; width: 120px; text-align: center;">
                            <img src="${product?.image || ''}" alt="${product?.name
}" style="max-width: 120px; height: 120px; border-radius: 8px; display: block; margin: 0 auto;">
                          </td>
                          <td style="padding: 0 10px; vertical-align: middle; text-align: right;">
                            <span style="display: block; font-size: 18px; color: #333333; margin-bottom: 8px;">${product?.name
}</span>
                            <span style="display: block; font-size: 14px; color: #666666; margin-bottom: 8px;">כמות: ${product?.quantity
}</span>
                            <span style="display: block; font-size: 16px; color: #333333; margin-bottom: 8px;">₪${product?.price
}</span>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 4px;">
                              <tr>
                                <td style="background: ${externalApi?.primaryColor || '#0d9488'
}; border-radius: 6px;" align="center">
                                  <a href="${purchaserVerifyLink}" style="display: inline-block; padding: 10px 18px; font-size: 14px; color: #ffffff; text-decoration: none; font-weight: 500;">בקר והזמן מפגש</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style="padding: 0 10px 0 0; vertical-align: middle; width: 120px; text-align: center;">
                            ${product?.qrCodeUrl
    ? `<img src="${product?.qrCodeUrl
    }" alt="Booking QR Code" width="104" height="104" style="width: 104px; height: 104px; border: 3px solid ${externalApi?.primaryColor || '#0d9488'
    }; border-radius: 8px; display: block; margin: 0 auto;">`
    : ''
}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table cellpadding="0" cellspacing="0" border="0" width="100%" class="lsb-card-mobile" style="display: none; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 14px; background: #f9f9f9; direction: rtl; border-radius: 20px; text-align: center;">
                      <img src="${product?.image || ''}" alt="${product?.name
}" style="width: 100%; max-width: 220px; height: auto; border-radius: 8px; display: block; margin: 0 auto 12px;">
                      <span style="display: block; font-size: 18px; color: #333333; margin-bottom: 8px;">${product?.name
}</span>
                      <span style="display: block; font-size: 14px; color: #666666; margin-bottom: 8px;">כמות: ${product?.quantity
}</span>
                      <span style="display: block; font-size: 16px; color: #333333; margin-bottom: 8px;">₪${product?.price
}</span>
                      <table cellpadding="0" cellspacing="0" border="0" style="margin: 4px auto 16px;">
                        <tr>
                          <td style="background: ${externalApi?.primaryColor || '#0d9488'
}; border-radius: 6px;" align="center">
                            <a href="${purchaserVerifyLink}" style="display: inline-block; padding: 10px 18px; font-size: 14px; color: #ffffff; text-decoration: none; font-weight: 500;">בקר והזמן מפגש</a>
                          </td>
                        </tr>
                      </table>
                      ${product?.qrCodeUrl
    ? `<img src="${product?.qrCodeUrl
    }" alt="Booking QR Code" style="width: 160px; max-width: 60%; height: auto; border: 3px solid ${externalApi?.primaryColor || '#0d9488'
    }; border-radius: 8px; display: block; margin: 0 auto;">`
    : ''
}
                    </td>
                  </tr>
                </table>
                `;

                  // Send Email #2 (Session booking confirmation) - one per ticket
                  await this.mailchimpService.sendTransactionalEmail({
                    to: email,
                    templatedId:
                      DynamicEmailTemplate.SessionBookingConfirmation,
                    from_email: externalApi?.companyDetails?.email,
                    from_name: externalApi?.name,
                    mergeVars: {
                      ...orderEmailFields,
                      BUYERNAME: group.buyerName || '',
                      BUYEREMAIL: email || '',
                      CUSTOMER_NAME: group.buyerName || '',
                      CUSTOMER_EMAIL: email || '',
                      EVENT_NAME:
                        eventDetails[0]?.nameHe
                        || eventDetails[0]?.name
                        || eventDetails[0]?.nameAr
                        || '',
                      BOOKING_LINK: purchaserVerifyLink,
                      PURCHASER_VERIFY_LINK: purchaserVerifyLink,
                      TOKEN_EXPIRY_DAYS: String(ttlDays),
                      HOLD_EXPIRY_MINUTES: '7',
                      CHANGE_SETTINGS_LINK: externalApi?.websiteUrl,
                      GREETING: product.greeting || '',
                      PRODUCTS_HTML: productHtml,
                      TOTALAMOUNT: product.price * product.quantity,
                      BUSINESSADDRESS: eventLocationForBusinessAddress || '',
                    },
                  });

                  this.logger.info('[LUMEN]: TICKET EMAIL SENT', {
                    email,
                    productName: product.name,
                  });
                }),
              );
            } catch (lumenErr) {
              this.logger.error('[LUMEN]: FAILED TO SEND TICKET EMAIL', {
                email,
                error:
                  lumenErr instanceof Error
                    ? lumenErr.message
                    : String(lumenErr),
              });
              // Don't throw - continue with other customers
            }
          }),
        );
      } catch (lumenError) {
        this.logger.error('[LUMEN]: SESSION BOOKING EMAIL FLOW FAILED', {
          error:
            lumenError instanceof Error
              ? lumenError.message
              : String(lumenError),
        });
        // Don't throw - session booking is optional, continue with rest of flow
      }
    } // ← Close: if (eventWrapperId)

    const eventCreatorUserData = eventDetails[0]?.userId;
    this.logger.info('[EMAIL]: EVENT CREATOR DEBUG', {
      eventCreatorUserId: eventDetails[0]?.userId?._id,
      eventCreatorUserIdType: typeof eventDetails[0]?.userId?._id,
      eventDetailsUserId: JSON.stringify(eventDetails[0]?.userId),
    });
    if (eventCreatorUserData) {
      const eventCreatorEmailForCreator = eventDetails[0]?.userId?.email;
      this.logger.info('[EMAIL]: EVENT CREATOR EMAIL DEBUG', {
        eventCreatorEmailForCreator,
        eventCreatorUser: JSON.stringify(eventDetails[0]?.userId),
      });
      if (eventCreatorEmailForCreator) {
        let eventCreatorTotalAmount = 0;
        const productsHtmlForEventCreator = orderProduct
          .map(orderItem => {
            const product = productInfo.find(
              p => p._id.toString() === orderItem.itemId.toString(),
            );

            if (!product) return '';

            const quantity = orderItem.quantity || 1;
            const price = orderItem.amount || product.price?.sellingPrice || 0;
            const deliveryFee = orderItem.deliveryFee || 0;

            const totalPriceForThisProduct = quantity * price + deliveryFee;
            eventCreatorTotalAmount += totalPriceForThisProduct;

            return `
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; background: #f9f9f9; direction: rtl; border-radius: 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 0; vertical-align: middle;">
                      <img src="${product?.images?.[0]?.image || ''}" alt="${product?.name
}"
                        style="max-width: 100px; height: 100px; margin-left: 10px; display: block;">
                    </td>
                    <td style="padding: 0 10px; vertical-align: middle;" width="100%">
                      <span style="display: block; font-size: 16px; color: #333333;">${product?.name
}</span>
                      <span style="display: block; font-size: 14px; color: #666666;">כמות: ${quantity}</span>
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

        try {
          const creatorMergeVars = {
            ...orderEmailFields,
            EVENT_NAME:
              eventDetails[0]?.nameHe
              || eventDetails[0]?.name
              || eventDetails[0]?.nameAr
              || '',
            TOTALAMOUNT: eventCreatorTotalAmount,
            BUYERNAME: order?.firstName,
            PRODUCTS_HTML: productsHtmlForEventCreator,
            BUYER_PHONE_NUMBER: order.phone,
            BUYER_ORDER_EMAIL: order.email,
            BUSINESSADDRESS: eventLocationForBusinessAddress || '',
          };
          this.logger.info('[EMAIL]: CREATOR EMAIL MERGE VARS', {
            eventCreatorEmail: eventDetails[0]?.userId?.email,
            mergeVars: JSON.stringify(creatorMergeVars),
          });
          await this.mailchimpService.sendTransactionalEmail({
            to: eventCreatorEmailForCreator,
            templatedId: DynamicEmailTemplate.TicketConfirmationForEventCreator,
            from_email: externalApi?.companyDetails?.email,
            from_name: externalApi?.name,
            subject: `הודעת מכירת כרטיס - ${eventDetails[0]?.nameHe
              || eventDetails[0]?.name
              || eventDetails[0]?.nameAr
            }`,
            mergeVars: creatorMergeVars,
          });
          this.logger.info('[EMAIL]: EVENT CREATOR EMAIL SENT', {
            eventCreatorEmailForCreator,
          });
        } catch (err) {
          this.logger.error('[EMAIL]: FAILED TO SEND EVENT CREATOR EMAIL', {
            eventCreatorEmailForCreator,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    // Send SMS confirmation to buyer if phone number is present
    if (order?.phone) {
      const countryCode = order?.countryCode || '972';
      const siteName = externalApi?.name || 'MetGo';
      const orderLink = `${(externalApi?.websiteUrl || '').replace(/\/$/, '')}/order-confirmation?orderId=${order?._id}`;
      console.log('========== GENERATED ORDER LINK (orders.services.ts - Tickets) ==========\n', orderLink, '\n========================================================================');
      const smsMessage = `שלום ${order?.firstName || ''
      }\nתודה על רכישתך מאתר ${siteName}\nכדי לצפות בפרטי ההזמנה יש להכנס ללינק הזה: ${orderLink}\nבברכה צוות ${siteName}\nלתמיכה ניתן ליצור איתנו קשר באמצעות המייל הבא: support@metgo.app`;

      try {
        await this.smsService.sendSms({
          firstName: order?.firstName || '',
          lastName: order?.lastName || '',
          phone: `+${countryCode}${order.phone}`,
          message: smsMessage,
          sender: 'TAV8',
          subject: 'Ticket Confirmation',
        });
        this.logger.info('[SMS]: TICKET CONFIRMATION SMS SENT', {
          orderId: order?._id,
          phone: order.phone,
        });
      } catch (smsError) {
        this.logger.error('[SMS]: FAILED TO SEND TICKET CONFIRMATION SMS', {
          orderId: order?._id,
          error:
            smsError instanceof Error ? smsError.message : String(smsError),
        });
      }
    }
  }

  async sendEmailPostOrderPayment(
    productInfo: Product[],
    order: Order,
    orderProduct: OrderProduct[],
    externalApi: any,
  ) {
    const businessIds = productInfo.map(pro => pro.businessId);

    const businessDetails = await this.businessService.findBusinessEmailByIds(
      businessIds,
    );

    const { emailFields } = await getCommonEmailFields(
      externalApi,
      this.docUploadService,
    );
    const orderEmailFields = {
      ...emailFields,
      BUTTON_LINK: externalApi?.websiteUrl,
    };

    type EmailOrderGroup = {
      buyerName: string;
      products: {
        quantity: number;
        image?: any;
        name: string;
        price: number;
        deliveryFee: number;
        businessName: string;
        businessPhone: string;
        businessEmail: string;
      }[];
      totalAmount: number;
    };

    const emailToProductsMap: { [email: string]: EmailOrderGroup } = {};

    orderProduct.forEach(orderItem => {
      const { email } = orderItem;
      const product = productInfo.find(
        p => p._id.toString() === orderItem.itemId.toString(),
      );

      if (!product) return;

      const business = businessDetails.find(
        busi => busi._id.toString() === product.businessId.toString(),
      );

      if (!business) return;

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

      const businessName = business.name;
      const businessPhone = business.phoneNumber;
      const businessEmail = business.busiEmail;

      emailToProductsMap[email].products.push({
        quantity,
        image: product?.images[0]?.image,
        name: product?.nameHe || product?.name || product?.nameAr,
        price,
        deliveryFee,
        businessName,
        businessPhone,
        businessEmail,
      });

      emailToProductsMap[email].totalAmount += price * quantity + deliveryFee;
    });

    await Promise.all(
      Object.entries(emailToProductsMap).map(async ([email, group]) => {
        const productsHtml = group.products
          .map(product => {
            const totalPrice = product.quantity * product.price;
            return `
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px; background: ${externalApi?.secondaryColor
}; direction: rtl; border-radius: 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 0; vertical-align: middle;">
                          <img src="${product?.image || ''}" alt="${product?.name
}"
                            style="max-width: 100px; height: 100px; margin-left: 10px; display: block;">
                        </td>
                        <td style="padding: 0 10px; vertical-align: middle;" width="100%">
                          <span style="display: block; font-size: 18px; color: #333333;">${product?.name
}</span>
                          <span style="display: block; font-size: 14px; color: #666666;">כמות: ${product?.quantity
}</span>
                          <span style="display: block; font-size: 14px; color: #666666;">סה״כ מחיר: ${product.quantity
} × ₪${product.price} = ₪${totalPrice}</span>
  <span style="display: block; font-size: 14px; color: #666666;">
  דמי משלוח: ₪${product?.deliveryFee}</span>
  <span style="display: block; font-size: 15px; color: #333333;">שם העסק: ${product?.businessName
}</span>
                          <span style="display: block; font-size: 14px; color: #666666;">דוא"ל עסקי: ${product?.businessEmail
}</span>
  <span style="display: block; font-size: 14px; color: #666666;">
 טלפון עסקי: ${product?.businessPhone}</span>
                        </td>
                        <td style="padding: 0; vertical-align: middle; white-space: nowrap;">
                          <span dir="rtl" style="font-size: 16px; color: #333333;">₪${totalPrice}</span>
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
          to: email,
          templatedId: DynamicEmailTemplate.OrderConfirmationForClient,
          from_email: externalApi?.companyDetails?.email,
          from_name: externalApi?.name,
          mergeVars: {
            ...orderEmailFields,
            PRODUCTS_HTML: productsHtml,
            BUYERNAME: group.buyerName || '',
            TOTALAMOUNT: group.totalAmount || 0,
            CHANGE_SETTINGS_LINK: externalApi?.websiteUrl,
            ORDER_HISTORY_LINK: `${externalApi?.websiteUrl}/order-history`,
            CUSTOMER_QRCODEURL: order?.qrCodeUrl || '',
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
              p => p.itemId.toString() === product._id.toString(),
            );

            if (!matchingProduct) return '';

            const quantity = matchingProduct.quantity || 1;
            const price
              = matchingProduct.amount || product.price?.sellingPrice || 0;
            const deliveryFee = matchingProduct.deliveryFee || 0;
            const totalProductPrice = quantity * price;
            const address
              = matchingProduct.deliveryMethod === DeliveryMethod.DELIVER
                ? [
                  matchingProduct?.houseNo,
                  matchingProduct?.apartment,
                  matchingProduct?.street,
                  matchingProduct?.city,
                  matchingProduct?.deliveryArea,
                ]
                  .filter(Boolean)
                  .join(', ')
                || matchingProduct.deliveryPickupLocation
                || ''
                : `מיקום העסק שלך - ${business?.address?.location}`;

            // const totalPriceForThisProduct = quantity * price + deliveryFee;
            const totalPriceForThisProduct = totalProductPrice + deliveryFee;

            businessTotalAmount += totalPriceForThisProduct;

            return `
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; background: ${externalApi?.secondaryColor
}; direction: rtl; border-radius: 20px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 0; vertical-align: middle;">
                        <img src="${product.images?.[0]?.image || ''}" alt="${product?.nameHe || product?.name || product?.nameAr
}"
                          style="max-width: 100px; height: 100px; margin-left: 10px; display: block;">
                      </td>
                      <td style="padding: 0 10px; vertical-align: middle;" width="100%">
                        <span
                          style="display: block; font-size: 16px; color: #333333;">${product?.nameHe || product?.name || product?.nameAr
}</span>
                        <span style="display: block; font-size: 14px; color: #666666;">כמות:
                            ${quantity}</span>
                            <span style="display: block; font-size: 14px; color: #666666;">סה״כ מחיר: ${quantity} × ₪${price} = ₪${totalProductPrice}</span>
                        <span style="display: block; font-size: 14px; color: #666666;">שיטת משלוח: ${matchingProduct.deliveryMethod
                === DeliveryMethod.DELIVER
    ? 'לספק ללקוח'
    : 'איסוף עצמי על ידי הלקוח'
}</span>
<span style="display: block; font-size: 14px; color: #666666;">
  דמי משלוח: ₪${deliveryFee}</span>
<span style="display: block; font-size: 14px; color: #666666;">כתובת: ${address || 'לא ישים'
}</span>
                      </td>
                      <td style="padding: 0; vertical-align: middle; white-space: nowrap;">
                           <span dir="rtl" style="font-size: 16px; color: #333333;">₪${totalProductPrice}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
              `;
          })
          .join('');

        const buyerAddress = this.extractBuyerAddress(
          orderProduct,
          order?.address || '',
        );

        const { FE } = this.configService.baseUrl;
        const workspaceLink = FE;

        await this.mailchimpService.sendTransactionalEmail({
          to: business?.busiEmail,
          templatedId: DynamicEmailTemplate.OrderConfirmationForVendor,
          from_email: externalApi?.companyDetails?.email,
          from_name: externalApi?.name,
          mergeVars: {
            ...orderEmailFields,
            BUSINESSNAME: business?.name || '',
            BUSINESSPHONE:
              `${business?.countryCode}-${business?.phoneNumber}` || '',
            BUSINESSEMAIL: business?.busiEmail || '',
            TOTALAMOUNT: businessTotalAmount || 0,
            BUYERNAME: order?.firstName || '',
            PRODUCTS_HTML: productsHtmlForEchBusiness,
            BUYER_PHONE_NUMBER: order.phone || '',
            BUYER_ORDER_EMAIL: order?.email || '',
            BUYER_ADDRESS: buyerAddress,
            QRCODEURL: '',
            WORKSPACE_LINK: workspaceLink,
          },
        });
      }),
    );

    // Send SMS confirmation to buyer if phone number is present
    if (order?.phone) {
      const countryCode = order?.countryCode || '972';
      const siteName = externalApi?.name || 'MetGo';
      const orderLink = `${(externalApi?.websiteUrl || '').replace(/\/$/, '')}/order-confirmation?orderId=${order?._id}`;
      console.log('========== GENERATED ORDER LINK (orders.services.ts) ==========\n', orderLink, '\n===============================================================');
      const smsMessage = `שלום ${order?.firstName || ''
      }\nתודה על רכישתך מאתר ${siteName}\nכדי לצפות בפרטי ההזמנה יש להכנס ללינק הזה: ${orderLink}\nבברכה צוות ${siteName}\nלתמיכה ניתן ליצור איתנו קשר באמצעות המייל הבא: support@metgo.app`;

      try {
        await this.smsService.sendSms({
          firstName: order?.firstName || '',
          lastName: order?.lastName || '',
          phone: `+${countryCode}${order.phone}`,
          message: smsMessage,
          sender: 'TAV8',
          subject: 'Order Confirmation',
        });
        this.logger.info('[SMS]: ORDER CONFIRMATION SMS SENT', {
          orderId: order?._id,
          phone: order.phone,
        });
      } catch (smsError) {
        this.logger.error('[SMS]: FAILED TO SEND ORDER CONFIRMATION SMS', {
          orderId: order?._id,
          error:
            smsError instanceof Error ? smsError.message : String(smsError),
        });
      }
    }
  }

  async generateQRCodeAndToken(
    orderId: string,
    vendorId?: string,
    userEmail?: string,
    userRole?: string,
  ): Promise<{ qrCodeUrl: string; token: string }> {
    try {
      let finalUserId = '';
      let finalUserEmail = userEmail || '';
      const finalUserRole = userRole || 'traveller';

      // Get the business owner's user ID for specific vendor
      try {
        const vendorOwner = await this.getVendorOwnerForOrder(
          orderId,
          vendorId,
        );
        if (vendorOwner) {
          finalUserId = vendorOwner.userId;
          finalUserEmail = vendorOwner.email || '';
        }
      } catch (err) {
        this.logger.warn('[ORDER]: FAILED TO GET VENDOR INFO', {
          orderId,
          vendorId,
          error: err instanceof Error ? err.message : String(err),
        });
      }

      if (!finalUserId) {
        throw new BadRequestException('Unable to resolve vendor user for QR');
      }

      const token = await this.qrTokenService.generateToken(
        orderId,
        finalUserId,
        finalUserEmail,
        finalUserRole,
      );

      const { FE } = this.configService.baseUrl;
      const workspaceLink = `${FE}orders-management?token=${token}&orderId=${orderId}`;

      const qrCodeUrl = await this.qrCodeService.generateQRCode(
        workspaceLink,
        `order-${orderId}`,
      );

      this.logger.info('[ORDER]: QR CODE GENERATED', {
        orderId,
        qrCodeUrl,
      });

      return { qrCodeUrl, token };
    } catch (error: unknown) {
      const errorMessage
        = error instanceof Error ? error.message : String(error);
      this.logger.error('[ORDER]: FAILED TO GENERATE QR CODE', {
        error: errorMessage,
      });
      throw error;
    }
  }

  async getOrderConfirmationDetails(orderId: string) {
    const order: any = await this.findOneById(orderId, 'campId');
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const childOrders = await this.OrderModel.find({ parentOrderId: orderId }).select('_id vendorId qrCodeUrl').lean();
    const orderIdsToSearch = childOrders.length > 0
      ? [orderId, ...childOrders.map(c => c._id.toString())]
      : [orderId];

    const [orderProducts, externalApi] = await Promise.all([
      this.OrderProductModel.find({ orderId: { $in: orderIdsToSearch } }).lean(),
      this.externalApiService.findByIdAndPopulateTheme(
        String(order?.externalApiId),
      ),
    ]);

    const productIds = [
      ...new Set(
        orderProducts.map(op => op.itemId?.toString()).filter(Boolean),
      ),
    ];
    const isTicket = orderProducts.some(
      (op: any) => op.itemType === OrderItemType.TICKET,
    );
    const websiteUrl = (externalApi?.websiteUrl || '').replace(/\/$/, '');

    // Generate QR code scan URL with token
    let qrCodeScanUrl = '';
    try {
      const vendorOwner = await this.getVendorOwnerForOrder(orderId);
      if (vendorOwner) {
        const token = await this.qrTokenService.generateToken(
          orderId,
          vendorOwner.userId,
          vendorOwner.email || '',
          'traveller',
        );
        const { FE } = this.configService.baseUrl;
        qrCodeScanUrl = `${FE}orders-management?token=${token}&orderId=${orderId}`;
      }
    } catch (error) {
      this.logger.warn('[ORDER]: FAILED TO GENERATE QR SCAN URL', {
        orderId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    let productInfoList: any[] = [];
    if (productIds.length > 0) {
      if (isTicket) {
        productInfoList = await this.queryBus.execute(
          new GetTicketByIdsQuery(productIds),
        );
      } else {
        productInfoList = await this.productsService.getProductInformationForOrders(
          productIds.map(id => ({ id })),
        );
      }
    }

    // Detect multi-vendor: more than one distinct businessId in products
    const distinctBusinessIds = [
      ...new Set(
        productInfoList
          .map((p: any) => p.businessId?.toString())
          .filter(Boolean),
      ),
    ];
    const isMultiVendor = !isTicket && distinctBusinessIds.length > 1;
    const isMiniSite = order?.campId?.type === 'MINI_SITE';

    // Determine templateId
    let templateId = DynamicEmailTemplate.OrderConfirmationForClient;
    if (isMiniSite) {
      templateId = DynamicEmailTemplate.OrderConfirmationForClientMiniSite;
    } else if (isMultiVendor) {
      templateId = DynamicEmailTemplate.OrderConfirmationForClientMultiVendor;
    }

    let eventName = '';
    let eventDate = '';
    let eventLocation = '';
    let isSessionBooking = false;
    let purchaserVerifyLink = '';
    let tokenExpiryDays = '';

    if (isTicket) {
      const firstProduct = productInfoList[0] as any;
      if (firstProduct) {
        eventName
          = firstProduct?.nameHe
          || firstProduct?.name
          || firstProduct?.nameAr
          || '';
        eventDate = firstProduct?.eventDate || firstProduct?.startDate || '';
        eventLocation
          = firstProduct?.eventLocation || firstProduct?.location || '';
        isSessionBooking = !!firstProduct?.wrapperId;

        if (isSessionBooking) {
          const uniqueCode = `TICKET-${Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase()}`;

          let eventLastDate: Date | undefined;
          if (firstProduct.eventId) {
            const eventDetails = await this.queryBus.execute(
              new GetEventByIdsQuery([firstProduct.eventId]),
            );
            if (eventDetails?.[0]?.dayDescription?.length) {
              eventLastDate = new Date(
                eventDetails[0].dayDescription[
                  eventDetails[0].dayDescription.length - 1
                ].date,
              );
            }
          }

          const matchingOrderProduct = orderProducts.find(
            op => op.itemId?.toString() === firstProduct._id?.toString(),
          );

          const { token, ttlDays } = this.sessionBookingsService.generateInviteToken({
            name: order.firstName || '',
            email: order.email || '',
            phone: order.phone || '',
            wrapperId: firstProduct.wrapperId,
            code: uniqueCode,
            eventLastDate,
            orderProductId: matchingOrderProduct?._id?.toString(),
          });

          purchaserVerifyLink = `${websiteUrl}/purchaser-verify?code=${token}`;
          tokenExpiryDays = ttlDays.toString();
        }
      }
      templateId = isSessionBooking
        ? DynamicEmailTemplate.SessionBookingConfirmation
        : DynamicEmailTemplate.TicketConfirmationForCustomers;
    }

    // Common email fields — logo, banners, footer images, social links
    const { emailFields } = await getCommonEmailFields(
      externalApi,
      this.docUploadService,
    );

    // Build structured products array (used by single-vendor & ticket templates)
    const products = orderProducts.map(op => {
      const pInfo = productInfoList.find(
        p => p._id.toString() === op.itemId.toString(),
      ) as any;
      const price = op.amount || pInfo?.price?.sellingPrice || 0;
      const quantity = op.quantity || 1;
      return {
        name: pInfo?.nameHe || pInfo?.name || '',
        quantity,
        price,
        totalPrice: price * quantity,
        image: pInfo?.images?.[0]?.image || pInfo?.image || '',
        qrCodeUrls: op.qrCodeUrl ? op.qrCodeUrl.split('|') : [],
        greeting: (op as any).greeting || pInfo?.greeting || '',
        deliveryFee: op.deliveryFee || 0,
        deliveryMethod: op.deliveryMethod || '',
        businessId: pInfo?.businessId?.toString() || '',
      };
    });

    const totalAmount = products.reduce((acc, p) => acc + p.totalPrice, 0);
    const totalDeliveryFee = products.reduce(
      (acc, p) => acc + (p.deliveryFee || 0),
      0,
    );

    // Build per-vendor grouped data (used by multi-vendor template)
    // Frontend uses VENDORS array to render each vendor section with their products + QR
    let vendors: any[] = [];
    if (isMultiVendor) {
      const businessIds = distinctBusinessIds;
      const businessDetails = await this.businessService.findBusinessEmailByIds(
        businessIds as any[],
      );

      // Generate vendor-specific QR code scan URLs
      const vendorQrScanUrls: { [vendorId: string]: string } = {};
      await Promise.all(
        childOrders.map(async (childOrder: any) => {
          if (childOrder.vendorId) {
            try {
              const vendorOwner = await this.getVendorOwnerForOrder(
                childOrder._id.toString(),
                childOrder.vendorId.toString(),
              );
              if (vendorOwner) {
                const token = await this.qrTokenService.generateToken(
                  childOrder._id.toString(),
                  vendorOwner.userId,
                  vendorOwner.email || '',
                  'traveller',
                );
                const { FE } = this.configService.baseUrl;
                vendorQrScanUrls[childOrder.vendorId.toString()] = `${FE}orders-management?token=${token}&orderId=${childOrder._id.toString()}`;
              }
            } catch (error) {
              this.logger.warn('[ORDER]: FAILED TO GENERATE VENDOR QR SCAN URL', {
                vendorOrderId: childOrder._id,
                vendorId: childOrder.vendorId,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }
        }),
      );

      vendors = businessDetails.map((business: any) => {
        const vendorProducts = products.filter(
          p => p.businessId === business._id?.toString(),
        );
        const vendorSubtotal = vendorProducts.reduce(
          (acc, p) => acc + p.totalPrice,
          0,
        );
        const vendorDeliveryFee = vendorProducts.reduce(
          (acc, p) => acc + (p.deliveryFee || 0),
          0,
        );
        // QR code for this vendor is stored on the child order (vendor-specific order)
        const vendorChildOrder = childOrders.find(
          co => co.vendorId?.toString() === business._id?.toString(),
        );
        const vendorQrCodeUrl = vendorChildOrder?.qrCodeUrl || '';
        const vendorQrCodeScanUrl = vendorQrScanUrls[business._id?.toString()] || '';

        return {
          vendorName: business.name || '',
          vendorEmail: business.busiEmail || '',
          vendorPhone: business.phoneNumber || '',
          products: vendorProducts,
          subtotal: vendorSubtotal,
          deliveryFee: vendorDeliveryFee,
          total: vendorSubtotal + vendorDeliveryFee,
          qrCodeUrl: vendorQrCodeUrl,
          qrCodeScanUrl: vendorQrCodeScanUrl,
        };
      });
    }

    return {
      templateId,
      mergeVars: {
        // ── Common (logo, banners, footer images & links, social) ──
        // Covers: LOGO, COLOR, BG_COLOR, WEBSITE_NAME,
        //   FOOTER1-5, FOOTER_BADGE, BANNER_IMG, MOBILE_BANNER_IMG,
        //   FOOTER_BANNER, FOOTER_BANNER_MOBILE, FOOTER_BANNER_MINISITE_BANNER,
        //   FOOTER_LINK1-4, FACEBOOK_LINK, WHATSAPP_LINK
        ...emailFields,

        // ── Buyer / Order ──
        BUYERNAME: order.firstName || '',
        BUYEREMAIL: order.email || '',
        TOTALAMOUNT: totalAmount,
        BUTTON_LINK: websiteUrl,
        CHANGE_SETTINGS_LINK: websiteUrl,
        ORDER_HISTORY_LINK: `${websiteUrl}/order-history`,

        // ── QR Code fields (both variants used across templates) ──
        // order-confirmation-client-side-en uses CUSTOMER_QRCODEURL
        // create-minisite-orders-for-client uses QRCODEURL
        CUSTOMER_QRCODEURL: (order as any).qrCodeUrl || '',
        QRCODEURL: (order as any).qrCodeUrl || '',
        QRCODE_SCAN_URL: qrCodeScanUrl,

        // ── Event / Ticket specific ──
        EVENT_NAME: eventName,
        EVENT_DATE: eventDate,
        EVENT_LOCATION: eventLocation,
        BUSINESSADDRESS: eventLocation,
        GREETING: products[0]?.greeting || productInfoList[0]?.greeting || '',

        // ── Session-booking specific ──
        BOOKING_LINK: purchaserVerifyLink,
        PURCHASER_VERIFY_LINK: purchaserVerifyLink,
        TOKEN_EXPIRY_DAYS: tokenExpiryDays,
        HOLD_EXPIRY_MINUTES: '7',
        CUSTOMER_NAME: order.firstName || '',
        CUSTOMER_EMAIL: order.email || '',

        // ── Multi-vendor specific ──
        // order-confirmation-client-with-multi-vendor-qr uses VENDORS_WITH_QR_HTML & DELIVERY_FEE_SUMMARY
        // We return structured JSON instead so the frontend can build the HTML itself
        VENDORS: vendors, // Array of vendor objects with products + QR
        DELIVERY_FEE_TOTAL: totalDeliveryFee, // Total delivery fee across all vendors

        // ── Products (single-vendor / ticket / mini-site templates) ──
        PRODUCTS: products,
      },
    };
  }
}
