import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Request } from 'express';
import { Model } from 'mongoose';

import { Locale, PaymentStatus, VoucherPaymentStatus } from 'src/common/enum';
import { EnglishTemplate, HebrewTemplate } from 'src/common/mailchimp/templateId';
import { ConfigService } from '../config/config.service';
import { Payment } from './schema/payments.schema';
import { update } from 'src/core/helper/query-helper';
import { BusinessService } from 'src/modules/business/business.service';
import { OrdersService } from 'src/modules/orders/orders.services';
import { ProductsService } from 'src/modules/products/products.services';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { GenerateLinkCommand, PaymentPurpose } from 'src/services/payments/payments.type';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel('Payment')
    private readonly PaymentModel: Model<Payment>,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => VoucherService))
    private readonly voucherService: VoucherService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private mailchimpService: MailChimpService,
    private readonly businessService: BusinessService,
    private readonly productsService: ProductsService,
  ) { }

  async createPayment(insertField:any) {
    return await this.PaymentModel.create(insertField);
  }

  async generateLink(command: GenerateLinkCommand) {
    const {
      amount, currency, purpose, id, customerEmail, customerName, languagePreference,
    } = command;
    const payPlusResponse = await axios.post(
      `${this.configService.paymentDetails.URL}PaymentPages/generatelink`,
      {
        payment_page_uid: this.configService.paymentDetails.PAGE_UUID,
        amount,
        currency_code: currency,
        refURL_success: `${this.configService.paymentDetails.SERVER_URL}${this.configService.paymentDetails.SUCCESS}`,
        refURL_failure: `${this.configService.paymentDetails.SERVER_URL}${this.configService.paymentDetails.FAILURE}`,
        more_info: purpose,
        more_info_1: customerEmail,
        more_info_2: customerName,
        more_info_3: languagePreference,
      },
      {
        headers: {
          ContentType: 'application/json',
          Authorization: `{"api_key": "${this.configService.paymentDetails.API}","secret_key": "${this.configService.paymentDetails.SECRET}"}`,
        },
      },
    );
    let insertField : any = {
      purpose,
      amount,
      currency,
      paymentRequestId: payPlusResponse.data.data.page_request_uid,
    };
    if (purpose === PaymentPurpose.VOUCHER) {
      insertField = {
        ...insertField,
        voucherId: id,
      };
    }

    if (purpose === PaymentPurpose.ORDER) {
      insertField = {
        ...insertField,
        orderId: id,
      };
    }

    if (payPlusResponse.data.results.status === 'success') {
      await this.createPayment(insertField);
    }

    return payPlusResponse.data;
  }

  async paymentSucess(request: Request) {
    const requestBody = request.body;

    const pageRequestUid = requestBody?.page_request_uid;

    const updateField = {
      customerName: requestBody?.customer_name,
      identificationNumber: requestBody?.identification_number,
      customerEmail: requestBody?.more_info_1,
      method: requestBody?.method,
      status: PaymentStatus.SUCCESS,
    };
    const payments = await update<Payment>(
      this.PaymentModel,
      'paymentRequestId',
      pageRequestUid,
      updateField,
    );

    await this.mailchimpService.sendTransactionalEmail({
      to: requestBody?.more_info_1,
      templatedId: requestBody.more_info_3 === Locale.HEBREW
        ? HebrewTemplate.PaymentSuccessful
        : EnglishTemplate.PaymentSuccessful,
      mergeVars: {
        FNAME: requestBody?.more_info_2,
        TOTALAMOUNT: requestBody?.amount,
      },
    });

    if (requestBody?.more_info === PaymentPurpose.VOUCHER) {
      await this.voucherService.updateAfterPaymentSuccess({
        ids: payments.voucherId,
        updateField: { paymentStatus: VoucherPaymentStatus.PAID },
        voucherOwnerEmail: requestBody?.more_info_1,
        voucherOwnerName: requestBody?.more_info_2,
        languagePreference: requestBody.more_info_3,
      });
    }

    if (requestBody?.more_info === PaymentPurpose.ORDER) {
      const updateOrder = await this.ordersService.updateOrderAfterPayment(payments.orderId);

      const [getProductInformation, businessDetails] = await Promise.all([
        this.productsService.getProductInformationForOrders(updateOrder.products),
        this.businessService.findBusinessEmailByIds(updateOrder.businessId),
      ]);

      await this.mailchimpService.sendTransactionalEmail({
        to: updateOrder.email,
        templatedId: requestBody.more_info_3 === Locale.HEBREW
          ? HebrewTemplate.OrderConfirmationForClient
          : EnglishTemplate.OrderConfirmationForClient,
        mergeVars: {
          FNAME: updateOrder.firstName,
          BUYERNAME: businessDetails[0].name,
          PRODUCTNAME: getProductInformation[0].name,
          QUANTITY: 1,
          COST: getProductInformation[0].price.sellingPrice,
          TOTALAMOUNT: updateOrder.totalAmount,
          PHONE: businessDetails[0].phoneNumber,
          EMAIL: businessDetails[0].busiEmail,
        },
      });
      // SEND TO BUSINESS OWNER

      await Promise.all(businessDetails.map(async business => {
        if (!business?.busiEmail) return;
        await this.mailchimpService.sendTransactionalEmail({
          to: business.busiEmail,
          templatedId: requestBody.more_info_3 === Locale.HEBREW
            ? HebrewTemplate.OrderReceivedForBusiness
            : EnglishTemplate.OrderReceivedForBusiness,
          mergeVars: {
            BUSINESSNAME: business?.name || '',
            PRODUCTNAME: getProductInformation[0].name,
            QUANTITY: 1,
            COST: getProductInformation[0].price.sellingPrice,
            TOTALAMOUNT: updateOrder.totalAmount,
            BUYERNAME: `${updateOrder.firstName} ${updateOrder.lastName}`,
            BUYERPHONE: updateOrder.phone,
            BUYEREMAIL: updateOrder.email,
          },
        });
      }));
    }
  }

  PaymentFailure() {}
}
