import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateMiniSiteOrderCommand } from '../create-mini-site-order.command';
import { BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CartService } from 'src/modules/cart/cart.service';
import { CartStatus } from 'src/modules/cart/cart.types';
import { OrderItemType, OrderStatus, PaymentMode } from '../../orders.type';
import { ProductsService } from 'src/modules/products/products.services';
import { calculateProductsTotalAmount } from 'src/common/calculate-products-total-amount';
import { CampaignType } from 'src/modules/campaign/campaign.type';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateMiniSiteOrderInterface } from '../../interface/create-order.interface';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from '../../schema/orders.schema';
import { Model } from 'mongoose';
import { ConfigService } from 'src/services/config/config.service';
import { QRCodeService } from 'src/services/qr-code/qr-code.service';
import { Locale, PaymentStatus, VoucherStatus } from 'src/common/enum';
import { Product } from 'src/modules/products/schema/products.schema';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { PaymentsService } from 'src/services/payments/payments.service';
import { OrderProductService } from 'src/modules/order-product/order-product.services';
import { OrderProduct } from 'src/modules/order-product/schema/order-product.schema';
import { getCommonEmailFields } from 'src/common/utils/email/common-fields';
import { DynamicEmailTemplate } from 'src/common/mailchimp/templateId';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { SmsService } from 'src/services/sms/sms.service';
import { BusinessService } from 'src/modules/business/shared/services/business.service';
import { DocUploadService } from 'src/modules/doc-upload/doc-upload.service';
import { notifyHighValueOrder } from 'src/modules/orders/high-value-order-alert';

@CommandHandler(CreateMiniSiteOrderCommand)
export class CreateMiniSiteOrderHandler
implements ICommandHandler<CreateMiniSiteOrderCommand> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    @Inject(forwardRef(() => VoucherService))
    private readonly voucherService: VoucherService,
    private readonly campaignService: CampaignService,
    private readonly externalApiService: ExternalApiServices,
    private readonly configService: ConfigService,
    private readonly qrCodeService: QRCodeService,
    private readonly paymentService: PaymentsService,
    private readonly orderProductService: OrderProductService,
    private readonly mailchimpService: MailChimpService,
    private readonly businessService: BusinessService,
    private readonly docUploadService: DocUploadService,
    private readonly smsService: SmsService,
  ) {}

  async execute(command: CreateMiniSiteOrderCommand): Promise<any> {
    const { body, loggedInUser } = command;
    try {
      if (!body.email && !body.phone) {
        throw new BadRequestException('Please enter email or phone');
      }

      if (body?.voucher?.length !== 1) {
        throw new BadRequestException('Enter only one voucher');
      }

      const bodyVoucher = body.voucher[0];

      const cartDetails = await this.cartService.findOneById(body.cartId);

      if (
        cartDetails?.status === CartStatus.TIME_OUT
        || cartDetails?.status === CartStatus.ORDER_PLACED
      ) {
        throw new BadRequestException(
          'This cart is no longer available to checkout',
        );
      }

      const vouchers = (
        await this.voucherService.findByValidIds([bodyVoucher.id])
      )[0];

      const campaign: any = vouchers.campId;

      if (campaign.type !== CampaignType.MINI_SITE) {
        throw new BadRequestException(
          'This voucher is not applicable for regular purchases',
        );
      }

      const cartProducts = cartDetails.product
        .filter(product => product.itemType === OrderItemType.PRODUCT)
        .map(product => product.id.toString());

      const productsFromDB = cartProducts?.length
        ? await this.productsService.findManyById(cartProducts)
        : [];

      const { payableAmount, cartItems, totalDeliveryFee }
        = await calculateProductsTotalAmount(
          cartDetails?.product,
          productsFromDB,
        );

      const totalAmountToPay = payableAmount;

      const redeemedVouchers = [
        {
          id: bodyVoucher.id,
          redeemedAmount: payableAmount,
        },
      ];

      if (vouchers.status === VoucherStatus.EXPIRED) {
        throw new BadRequestException(
          'The voucher is expired and cannot be used.',
        );
      }

      const products = cartDetails.product.map(pro => ({
        id: pro.id.toString(),
      }));

      const cartItemsProduct = cartItems.filter(
        product => product.itemType === OrderItemType.PRODUCT,
      );

      const order = await this.createOrderForMiniSite({
        loggedInUser,
        body,
        redeemedVouchers,
        totalAmount: totalAmountToPay,
        payableAmount,
        products,
        productDetails: productsFromDB,
        cartItemsProduct,
        totalDeliveryFee,
      });

      await this.voucherService.update([vouchers._id], {
        status: VoucherStatus.EXPIRED,
      });

      return order;
    } catch (error) {
      this.logger.error('[MINI-SITE-ORDER]: FAILED TO CREATE ORDER', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  private async createOrderForMiniSite(
    orderCommand: CreateMiniSiteOrderInterface,
  ): Promise<any> {
    const {
      loggedInUser,
      body,
      redeemedVouchers,
      totalAmount,
      payableAmount,
      totalDeliveryFee,
      products,
      productDetails,
      cartItemsProduct,
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
      const cartItems = cartItemsProduct;
      const orderProduct = await Promise.all(
        order.products.map(async product => {
          const cartItem = cartItems.find(
            item => item.id.toString() === product.id.toString(),
          );
          return await this.orderProductService.create({
            itemId: cartItem?.id,
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
            itemType: cartItem.itemType,
          });
        }),
      );

      if (cartItemsProduct?.length) {
        await this.productsService.deductQuantity(cartItemsProduct);
      }

      await this.cartService.updateCartPostCheckout(
        command.cartId,
        order._id,
        loggedInUser,
      );

      if (cartItemsProduct?.length) {
        await this.sendEmailForMiniSitePostOrderPayment(
          productDetails,
          order,
          orderProduct,
          command?.externalApi,
          command?.languagePreference,
        );
      }

      const productInvoice = await Promise.all(
        productDetails?.map(pro => ({
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
      // if voucher is mini site then expire

      return order;
    } catch (error) {
      this.logger.error('[EXTERNAL_API_ORDERS]: FAILED TO CREATE ORDER', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  private async sendEmailForMiniSitePostOrderPayment(
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

    const { emailFields } = await getCommonEmailFields(
      externalApi,
      this.docUploadService,
    );

    const orderEmailFields = {
      ...emailFields,
      BUTTON_LINK: externalApi?.themeId?.websiteUrl,
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
          templatedId: DynamicEmailTemplate.OrderConfirmationForClientMiniSite,
          from_email: externalApi?.companyDetails?.email,
          from_name: externalApi?.name,
          mergeVars: {
            ...orderEmailFields,
            PRODUCTS_HTML: productsHtml,
            BUYERNAME: group.buyerName,
            // TOTALAMOUNT: group.totalAmount,
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
            const address = matchingProduct?.deliveryPickupLocation || '';

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
            TOTALAMOUNT: businessTotalAmount,
            BUYERNAME: order?.firstName,
            PRODUCTS_HTML: productsHtmlForEchBusiness,
            BUYER_PHONE_NUMBER: order.phone,
            BUYER_ORDER_EMAIL: order?.email || '',
          },
        });
      }),
    );

    // Send SMS confirmation to buyer if phone number is present
    if (order?.phone) {
      const countryCode = order?.countryCode || '972';
      const siteName = externalApi?.name || 'MetGo';
      const orderLink = `${(externalApi?.themeId?.websiteUrl || '').replace(/\/$/, '')}/order-confirmation?orderId=${order?._id}`;
      console.log('========== GENERATED ORDER LINK (create-mini-site-order) ==========\n', orderLink, '\n===================================================================');
      const smsMessage = `שלום ${
        order?.firstName || ''
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
        this.logger.info('[SMS]: MINI-SITE ORDER CONFIRMATION SMS SENT', {
          orderId: order?._id,
          phone: order.phone,
        });
      } catch (smsError) {
        this.logger.error(
          '[SMS]: FAILED TO SEND MINI-SITE ORDER CONFIRMATION SMS',
          {
            orderId: order?._id,
            error:
              smsError instanceof Error ? smsError.message : String(smsError),
          },
        );
      }
    }
  }
}
