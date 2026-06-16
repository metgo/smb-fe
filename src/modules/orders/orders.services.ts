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
import {
  findOneByFieldNames,
  findOneById,
  updateById,
} from 'src/core/helper/query-helper';
import { calculateProductsTotalAmount } from 'src/common/calculate-products-total-amount';

import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { BusinessService } from 'src/modules/business/shared/services/business.service';
import { CartService } from 'src/modules/cart/cart.service';
import { Cart } from 'src/modules/cart/cart.schema';
import { CartProductResponse, CartStatus } from 'src/modules/cart/cart.types';
import { Order } from 'src/modules/orders/schema/orders.schema';
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

import { PaymentsService } from 'src/services/payments/payments.service';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { CreateOrderCommand } from 'src/modules/orders/interface/create-order.interface';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { QRCodeService } from 'src/services/qr-code/qr-code.service';
import { QrTokenService } from 'src/services/qr-token/qr-token.service';
import { ConfigService } from 'src/services/config/config.service';
import { OrderProduct } from 'src/modules/order-product/schema/order-product.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetTicketByIdsQuery } from '../tickets/queries/get-ticket-by-ids.query';
import { Ticket } from '../tickets/schema/tickets.schema';
import { GetEventByIdsQuery } from '../events/queries/get-by-ids.query';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly queryBus: QueryBus,
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
    private readonly qrTokenService: QrTokenService,
    private readonly configService: ConfigService,
    private readonly campaignService: CampaignService,
  ) {}

  async getVendorOwnerForOrder(orderId: string): Promise<{
    userId: string;
    email?: string;
  } | null> {
    const order = await findOneById(this.OrderModel, orderId);

    if (!order?.products?.[0]?.id) return null;

    const firstProduct = await this.productsService.findOne(
      order.products[0].id.toString(),
      Locale.ENGLISH,
    );

    if (!firstProduct?.businessId) return null;

    const businessDetails = await this.businessService.findBusinessEmailByIds([
      firstProduct.businessId.toString() as any,
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

      if (cartDetails?.vendorProducts?.length) {
        return await this.startVendorCartCheckout(
          body,
          loggedInUser,
          cartDetails,
        );
      }

      if (!body.email && !body.phone) {
        throw new BadRequestException('Please enter email or phone');
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
              totalAmountToPay = Math.round((totalAmountToPay - redeemedAmount) * 100) / 100;
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

    const payableAmount = Math.round(
      vendorProducts.reduce(
        (sum, vendor) => sum + vendor.totalAmount + (vendor.deliveryFee || 0),
        0,
      ) * 100,
    ) / 100;

    const totalDeliveryFee = Math.round(
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
            totalAmountToPay = Math.round((totalAmountToPay - redeemedAmount) * 100) / 100;
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
      const externalApi = await this.externalApiService.findByIdentifierId(
        body.identifierId,
      );
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
      };

      if (totalAmount <= 0) {
        return await this.createOrderWithOnlyVouchers(
          command,
          productDetails,
          ticketDetails,
          cartItemsProduct,
          cartItemsTicket,
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

    // create order products
    const cartItems = [...cartItemsProduct, ...cartItemsTicket];
    const orderProduct = (await Promise.all(
      order.products.map(async product => {
        const cartItem = cartItems.find(
          item => item.id.toString() === product.id.toString(),
        );
        if (!cartItem) return null;
        return await this.orderProductService.create({
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
        });
      }),
    )).filter(Boolean);

    if (cartItemsProduct?.length) {
      await this.productsService.deductQuantity(cartItemsProduct);
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
        command?.languagePreference,
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
        name: pro?.name,
      })),
    );
    const ticketInvoice = await Promise.all(
      ticketInfo?.map(ticket => ({
        id: ticket._id.toString(),
        price: ticket?.price?.sellingPrice,
        name: ticket?.name,
      })),
    );

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

    return order;
  }

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

      const externalApi
        = await this.externalApiService.findByIdAndPopulateTheme(
          updateOrder?.externalApiId?.toString(),
        );

      const cart = await this.cartService.updateCartPostPayment(orderId);

      // Split into per-vendor orders when cart was created vendor-wise
      if (cart?.vendorProducts?.length) {
        return await this.createVendorSplitOrders(updateOrder, cart, externalApi, languagePreference);
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

        const orderProduct = await Promise.all(
          updateOrder.products.map(async product => {
            const cartItem = findCartProducts.find(
              item => item.id.toString() === product.id.toString(),
            );

            const productsInfo = getProductsInformation.find(
              item => item._id.toString() === product.id.toString(),
            );

            return await this.orderProductService.create({
              itemId: new mongoose.Types.ObjectId(cartItem.id),
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
              itemType: cartItem.itemType,
            });
          }),
        );

        await this.sendEmailPostOrderPayment(
          getProductsInformation,
          updateOrder,
          orderProduct,
          externalApi,
          languagePreference,
        );
      }

      if (findCartTickets?.length) {
        const cartTickets = findCartTickets
          .filter(ticket => ticket.itemType === OrderItemType.TICKET)
          .map(ticket => ticket.id.toString());

        // await this.productsService.deductQuantity(findCartProducts);
        getTicketsInformation = await this.queryBus.execute(
          new GetTicketByIdsQuery(cartTickets),
        );

        const orderProduct = await Promise.all(
          updateOrder.products.map(async product => {
            const cartItem = findCartTickets.find(
              item => item.id.toString() === product.id.toString(),
            );

            const ticketInfo = getTicketsInformation.find(
              item => item._id.toString() === product.id.toString(),
            );

            return await this.orderProductService.create({
              itemId: new mongoose.Types.ObjectId(cartItem.id),
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
              amount: ticketInfo.price.sellingPrice,
              loggedInUserId: updateOrder.userId,
              orderId: updateOrder.id,
              itemType: cartItem.itemType,
            });
          }),
        );

        await this.sendEmailPostTicketPayment(
          getTicketsInformation,
          updateOrder,
          orderProduct,
          externalApi,
          languagePreference,
        );
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

  private async createVendorSplitOrders(
    parentOrder: Order,
    cart: Cart,
    externalApi: any,
    languagePreference?: Locale,
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
          creditCardPayment: vendor.totalAmount,
          deliveryFee: vendor.deliveryFee || 0,
          externalApiId: parentOrder.externalApiId,
          campId: parentOrder.campId,
          qrCodeUrl: parentOrder.qrCodeUrl,
          paymentDate: new Date(),
          vendorId: vendor._id,
          parentOrderId: parentOrder._id,
          createdBy: parentOrder.userId,
          createdAt: new Date(),
        });

        return vendorOrder.save();
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

    // Create order product records for each vendor order
    const orderProductsPerVendor = await Promise.all(
      vendorOrders.map(async (vendorOrder, index) => {
        const vendor = cart.vendorProducts[index];
        return Promise.all(
          vendor.products.map(p => this.orderProductService.create({
            itemId: new mongoose.Types.ObjectId(p._id.toString()),
            quantity: p.quantity,
            email: vendorOrder.email,
            countryCode: vendorOrder.countryCode,
            phone: vendorOrder.phone,
            firstName: vendorOrder.firstName,
            lastName: vendorOrder.lastName,
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
            amount: 0,
            orderId: vendorOrder.id,
            loggedInUserId: parentOrder.userId?.toString(),
            itemType: p.itemType,
          })),
        );
      }),
    );

    if (externalApi) {
      await this.sendEmailPostVendorOrderPayment(
        cart,
        parentOrder,
        vendorOrders,
        orderProductsPerVendor.flat(),
        externalApi,
        languagePreference,
      );
    }

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
    languagePreference?: Locale,
  ) {
    console.log(languagePreference);

    const allProductIds = cart.vendorProducts.flatMap(vendor => vendor.products.map(p => p._id.toString()));

    const [productInfo, businessDetails] = await Promise.all([
      this.productsService.getProductInformationForOrders(
        allProductIds.map(id => ({ id })),
      ),
      this.businessService.findBusinessEmailByIds(
        vendorOrders.map(o => o.vendorId as any),
      ),
    ]);

    const { bucketUrl, emailFields } = getCommonEmailFields(
      externalApi.identifierId,
      externalApi.themeId,
    );

    const orderEmailFields = {
      ...emailFields,
      BUTTON_LINK: externalApi?.themeId?.websiteUrl,
      BANNER_IMG: `${bucketUrl}footer/banner-web.png`,
      MOBILE_BANNER_IMG: `${bucketUrl}footer/banner-mobile.png`,
      WEBSITE_NAME: externalApi?.name,
    };

    const buildProductRow = (
      product: any,
      quantity: number,
      price: number,
      deliveryFee: number,
      extraFields = '',
    ) => `
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
        <tr>
          <td style="padding: 10px; background: ${externalApi?.themeId?.secondaryColor}; direction: rtl; border-radius: 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding: 0; vertical-align: middle;">
                  <img src="${product?.images?.[0]?.image || ''}" alt="${product?.name}"
                    style="max-width: 100px; height: 100px; margin-left: 10px; display: block;">
                </td>
                <td style="padding: 0 10px; vertical-align: middle;" width="100%">
                  <span style="display: block; font-size: 18px; color: #333333;">${product?.name}</span>
                  <span style="display: block; font-size: 14px; color: #666666;">כמות: ${quantity}</span>
                  <span style="display: block; font-size: 14px; color: #666666;">דמי משלוח: ₪${deliveryFee}</span>
                  ${extraFields}
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

    // Customer email — all products grouped by buyer email
    const emailToGroupMap: {
      [email: string]: { buyerName: string; productsHtml: string; totalAmount: number };
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

      const extraFields = business
        ? `<span style="display: block; font-size: 15px; color: #333333;">שם העסק: ${business.name}</span>
           <span style="display: block; font-size: 14px; color: #666666;">דוא"ל עסקי: ${business.busiEmail}</span>
           <span style="display: block; font-size: 14px; color: #666666;">טלפון עסקי: ${business.phoneNumber}</span>`
        : '';

      if (!emailToGroupMap[email]) {
        emailToGroupMap[email] = {
          buyerName: orderItem.firstName,
          productsHtml: '',
          totalAmount: 0,
        };
      }

      emailToGroupMap[email].productsHtml += buildProductRow(product, quantity, price, deliveryFee, extraFields);
      emailToGroupMap[email].totalAmount += price * quantity + deliveryFee;
    });

    await Promise.all(
      Object.entries(emailToGroupMap).map(([email, group]) => this.mailchimpService.sendTransactionalEmail({
        to: email,
        templatedId: DynamicEmailTemplate.OrderConfirmationForClient,
        from_email: externalApi?.companyDetails?.email,
        from_name: externalApi?.name,
        mergeVars: {
          ...orderEmailFields,
          PRODUCTS_HTML: group.productsHtml,
          BUYERNAME: group.buyerName || '',
          TOTALAMOUNT: group.totalAmount || 0,
          CHANGE_SETTINGS_LINK: externalApi?.themeId?.websiteUrl,
          BUSINESSADDRESS: businessDetails?.[0]?.address?.location || '',
          QRCODEURL: parentOrder?.qrCodeUrl || '',
        },
      })),
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

        let vendorTotalAmount = 0;

        const productsHtml = vendorOrderProducts
          .map(orderItem => {
            const product = productInfo?.find(
              p => p._id.toString() === orderItem.itemId.toString(),
            );
            if (!product) return '';

            const quantity = orderItem.quantity || 1;
            const price = orderItem.amount || product?.price?.sellingPrice || 0;
            const deliveryFee = orderItem.deliveryFee || 0;
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

            vendorTotalAmount += quantity * price + deliveryFee;

            return `
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px; background: ${externalApi?.themeId?.secondaryColor}; direction: rtl; border-radius: 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 0; vertical-align: middle;">
                          <img src="${product?.images?.[0]?.image || ''}" alt="${product?.name}"
                            style="max-width: 100px; height: 100px; margin-left: 10px; display: block;">
                        </td>
                        <td style="padding: 0 10px; vertical-align: middle;" width="100%">
                          <span style="display: block; font-size: 16px; color: #333333;">${product?.name}</span>
                          <span style="display: block; font-size: 14px; color: #666666;">כמות: ${quantity}</span>
                          <span style="display: block; font-size: 14px; color: #666666;">שיטת משלוח: ${
  orderItem.deliveryMethod === DeliveryMethod.DELIVER
    ? 'לספק ללקוח'
    : 'איסוף עצמי על ידי הלקוח'
}</span>
                          <span style="display: block; font-size: 14px; color: #666666;">דמי משלוח: ₪${deliveryFee}</span>
                          <span style="display: block; font-size: 14px; color: #666666;">כְּתוֹבֶת: ${address || 'לא ישים'}</span>
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
          to: business.busiEmail,
          templatedId: DynamicEmailTemplate.OrderConfirmationForVendor,
          from_email: externalApi?.companyDetails?.email,
          from_name: externalApi?.name,
          mergeVars: {
            ...orderEmailFields,
            BUSINESSNAME: business?.name || '',
            BUSINESSPHONE: `${business?.countryCode}-${business?.phoneNumber}` || '',
            BUSINESSEMAIL: business?.busiEmail || '',
            TOTALAMOUNT: vendorTotalAmount || 0,
            BUYERNAME: parentOrder?.firstName || '',
            PRODUCTS_HTML: productsHtml,
            BUYER_PHONE_NUMBER: parentOrder?.phone || '',
            BUYER_ORDER_EMAIL: parentOrder?.email || '',
            BUYER_ADDRESS: parentOrder?.address || '',
            QRCODEURL: vendorOrder?.qrCodeUrl || parentOrder?.qrCodeUrl || '',
          },
        });
      }),
    );
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

  async updateOrderStatus(
    id: string,
    body: any,
  ): Promise<Order> {
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
        throw new BadRequestException(
          'Completed orders cannot be changed',
        );
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
    console.log(languagePreference);

    const eventIds = productInfo.map(pro => pro.eventId);

    const eventDetails = await this.queryBus.execute(
      new GetEventByIdsQuery(eventIds),
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
      WEBSITE_NAME: externalApi?.name,
      BUSINESSNAME: eventDetails[0].name || '',
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
                <td style="padding: 10px; background: ${
  externalApi?.themeId.secondaryColor
}; direction: rtl; border-radius: 20px;">
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
          templatedId: DynamicEmailTemplate.TicketConfirmationForCustomers,
          from_email: externalApi?.companyDetails?.email,
          from_name: externalApi?.name,
          mergeVars: {
            ...orderEmailFields,
            EVENT_NAME: eventDetails[0].name || '',
            PRODUCTS_HTML: productsHtml,
            BUYERNAME: group.buyerName || '',
            TOTALAMOUNT: group.totalAmount || 0,
            CHANGE_SETTINGS_LINK: externalApi?.themeId?.websiteUrl,
            BUSINESSADDRESS: eventDetails[0]?.address?.location || '',
            QRCODEURL: order?.qrCodeUrl || '',
          },
        });
      }),
    );

    // SEND TO BUSINESS OWNER
    //     await Promise.all(
    //       businessDetails.map(async business => {
    //         const relevantProducts = productInfo.filter(
    //           product => product.businessId.toString() === business._id.toString(),
    //         );

    //         let businessTotalAmount = 0;

    //         const productsHtmlForEchBusiness = relevantProducts
    //           .map(product => {
    //             const matchingProduct = orderProduct.find(
    //               p => p.itemId.toString() === product._id.toString(),
    //             );

    //             if (!matchingProduct) return '';

    //             const quantity = matchingProduct.quantity || 1;
    //             const price
    //               = matchingProduct.amount || product.price?.sellingPrice || 0;
    //             const deliveryFee = matchingProduct.deliveryFee || 0;
    //             const address = matchingProduct?.deliveryPickupLocation || '';

    //             const totalPriceForThisProduct = quantity * price + deliveryFee;

    //             businessTotalAmount += totalPriceForThisProduct;

    //             return `
    //             <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
    //             <tr>
    //               <td style="padding: 10px; background: ${
    //   externalApi?.themeId.secondaryColor
    // }; direction: rtl; border-radius: 20px;">
    //                 <table cellpadding="0" cellspacing="0" border="0" width="100%">
    //                   <tr>
    //                     <td style="padding: 0; vertical-align: middle;">
    //                       <img src="${product.images?.[0]?.image || ''}" alt="${
    //   product?.name
    // }"
    //                         style="max-width: 100px; height: 100px; margin-left: 10px; display: block;">
    //                     </td>
    //                     <td style="padding: 0 10px; vertical-align: middle;" width="100%">
    //                       <span
    //                         style="display: block; font-size: 16px; color: #333333;">${
    //   product?.name
    // }</span>
    //                       <span style="display: block; font-size: 14px; color: #666666;">כמות:
    //                           ${quantity}</span>
    //                       <span style="display: block; font-size: 14px; color: #666666;">
    // דמי משלוח: ₪${deliveryFee}</span>
    // <span style="display: block; font-size: 14px; color: #666666;">כְּתוֹבֶת: ${
    //   address || 'לא ישים'
    // }</span>
    //                     </td>
    //                     <td style="padding: 0; vertical-align: middle; white-space: nowrap;">
    //                       <span dir="rtl" style="font-size: 16px; color: #333333;">₪${price}</span>
    //                     </td>
    //                   </tr>
    //                 </table>
    //               </td>
    //             </tr>
    //           </table>
    //             `;
    //           })
    //           .join('');

    //         await this.mailchimpService.sendTransactionalEmail({
    //           to: business?.busiEmail,
    //           templatedId: DynamicEmailTemplate.OrderConfirmationForVendor,
    //           from_email: externalApi?.companyDetails?.email,
    //           from_name: externalApi?.name,
    //           mergeVars: {
    //             ...orderEmailFields,
    //             TOTALAMOUNT: businessTotalAmount,
    //             BUYERNAME: order?.firstName,
    //             PRODUCTS_HTML: productsHtmlForEchBusiness,
    //             BUYER_PHONE_NUMBER: order.phone,
    //             BUYER_ORDER_EMAIL: order.email,
    //           },
    //         });
    //       }),
    //     );
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
      WEBSITE_NAME: externalApi?.name,
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

      const business = businessDetails.find(
        busi => busi._id.toString() === product.businessId.toString(),
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

      const businessName = business.name;
      const businessPhone = business.phoneNumber;
      const businessEmail = business.busiEmail;

      emailToProductsMap[email].products.push({
        quantity,
        image: product?.images[0]?.image,
        name: product?.name,
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
          .map(
            product => `
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px; background: ${
  externalApi?.themeId.secondaryColor
}; direction: rtl; border-radius: 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 0; vertical-align: middle;">
                          <img src="${product?.image || ''}" alt="${
  product?.name
}"
                            style="max-width: 100px; height: 100px; margin-left: 10px; display: block;">
                        </td>
                        <td style="padding: 0 10px; vertical-align: middle;" width="100%">
                          <span style="display: block; font-size: 18px; color: #333333;">${
  product?.name
}</span>
                          <span style="display: block; font-size: 14px; color: #666666;">כמות: ${
  product?.quantity
}</span>
  <span style="display: block; font-size: 14px; color: #666666;">
  דמי משלוח: ₪${product?.deliveryFee}</span>
  <span style="display: block; font-size: 15px; color: #333333;">שם העסק: ${
  product?.businessName
}</span>
                          <span style="display: block; font-size: 14px; color: #666666;">דוא"ל עסקי: ${
  product?.businessEmail
}</span>
  <span style="display: block; font-size: 14px; color: #666666;">
 טלפון עסקי: ${product?.businessPhone}</span>
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
          from_email: externalApi?.companyDetails?.email,
          from_name: externalApi?.name,
          mergeVars: {
            ...orderEmailFields,
            PRODUCTS_HTML: productsHtml,
            BUYERNAME: group.buyerName || '',
            TOTALAMOUNT: group.totalAmount || 0,
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
              p => p.itemId.toString() === product._id.toString(),
            );

            if (!matchingProduct) return '';

            const quantity = matchingProduct.quantity || 1;
            const price
              = matchingProduct.amount || product.price?.sellingPrice || 0;
            const deliveryFee = matchingProduct.deliveryFee || 0;
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

            const totalPriceForThisProduct = quantity * price + deliveryFee;

            businessTotalAmount += totalPriceForThisProduct;

            return `
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; background: ${
  externalApi?.themeId.secondaryColor
}; direction: rtl; border-radius: 20px;">
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
                        <span style="display: block; font-size: 14px; color: #666666;">שיטת משלוח: ${
  matchingProduct.deliveryMethod
                          === DeliveryMethod.DELIVER
    ? 'לספק ללקוח'
    : 'איסוף עצמי על ידי הלקוח'
}</span>
<span style="display: block; font-size: 14px; color: #666666;">
  דמי משלוח: ₪${deliveryFee}</span>
  <span style="display: block; font-size: 14px; color: #666666;">כְּתוֹבֶת: ${
  address || 'לא ישים'
}</span>
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
            BUYER_ADDRESS: order?.address || '',
            //             QRCODEURL: order?.qrCodeUrl || '',
            QRCODEURL: '',
          },
        });
      }),
    );
  }

  async generateQRCodeAndToken(
    orderId: string,
    userId?: string,
    userEmail?: string,
    userRole?: string,
  ): Promise<{ qrCodeUrl: string; token: string }> {
    try {
      let finalUserId = userId || '';
      let finalUserEmail = userEmail || '';
      const finalUserRole = userRole || 'traveller';

      // If userId not provided, get the business owner's user ID from the order.
      if (!finalUserId) {
        try {
          const vendorOwner = await this.getVendorOwnerForOrder(orderId);
          if (vendorOwner) {
            finalUserId = vendorOwner.userId;
            finalUserEmail = vendorOwner.email || '';
          }
        } catch (err) {
          this.logger.warn('[ORDER]: FAILED TO GET VENDOR INFO FROM PRODUCT', {
            orderId,
            error: err instanceof Error ? err.message : String(err),
          });
        }
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

      // const { FE } = this.configService.baseUrl;
      // const verifyUrl = `${FE}orders-management?token=${token}`;
      const verifyUrl = `https://stg.workspace.metgo.app/orders-management?token=${token}`;

      const qrCodeUrl = await this.qrCodeService.generateQRCode(
        verifyUrl,
        `order-${orderId}`,
      );

      await updateById(this.OrderModel, orderId, { qrCodeUrl });

      this.logger.info('[ORDER]: QR CODE GENERATED', {
        orderId,
        qrCodeUrl,
      });

      return { qrCodeUrl, token };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('[ORDER]: FAILED TO GENERATE QR CODE', {
        error: errorMessage,
      });
      throw error;
    }
  }
}
